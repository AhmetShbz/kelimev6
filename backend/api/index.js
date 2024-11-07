// api/index.js

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS ayarları
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://kelimev6.vercel.app'
    : 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Middleware
app.use(express.json({ limit: '50mb' }));

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
}).then(() => {
  console.log('MongoDB bağlantısı başarılı');
}).catch(err => {
  console.error('MongoDB bağlantı hatası:', err);
});

// Models
const User = require('../models/User');
const Word = require('../models/Word');
const Category = require('../models/Category');

// Middlewares
const authenticateToken = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Routes
const adminRoutes = require('../routes/adminRoutes');
const wordRoutes = require('../routes/wordRoutes');
const profileRoutes = require('../routes/profileRoutes');

// Route tanımlamaları
app.use('/api/admin', authenticateToken, adminMiddleware, adminRoutes);
app.use('/api/words', wordRoutes);
app.use('/api/profile', profileRoutes);

// Kullanıcı kayıt endpoint'i
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Kullanıcı zaten var mı kontrol et
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu kullanıcı adı veya email zaten kullanımda' });
    }

    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcı oluştur
    const user = new User({
      username,
      email,
      password: hashedPassword,
      isAdmin: false,
      learnedWordsCount: 0,
      dailyStreak: 0
    });
    await user.save();

    res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu' });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Kullanıcı giriş endpoint'i
app.post('/api/login', async (req, res) => {
  try {
    const { loginIdentifier, password } = req.body;

    // Kullanıcıyı e-posta veya kullanıcı adına göre bul
    const user = await User.findOne({
      $or: [{ email: loginIdentifier }, { username: loginIdentifier }]
    });

    if (!user) {
      return res.status(400).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Şifreyi kontrol et
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Geçersiz şifre' });
    }

    // JWT token oluştur
    const token = jwt.sign(
      {
        userId: user._id,
        isAdmin: user.isAdmin
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      userId: user._id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
      learnedWordsCount: user.learnedWordsCount,
      dailyStreak: user.dailyStreak,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Profil bilgileri güncelleme endpoint'i
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword, newEmail, profileImage } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Mevcut şifreyi doğrula
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mevcut şifre yanlış' });
    }

    // Güncellenecek alanları kontrol et
    const updates = {};

    if (newPassword) {
      updates.password = await bcrypt.hash(newPassword, 10);
    }

    if (newEmail && newEmail !== user.email) {
      const existingUser = await User.findOne({ email: newEmail });
      if (existingUser) {
        return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanımda' });
      }
      updates.email = newEmail;
    }

    if (profileImage) {
      updates.profileImage = profileImage;
    }

    // Kullanıcıyı güncelle
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Kullanıcı bilgileri güncellendi',
      user: updatedUser
    });
  } catch (error) {
    console.error('Güncelleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Kelime öğrenme durumu güncelleme endpoint'i
app.post('/api/words/learned', authenticateToken, async (req, res) => {
  try {
    const { wordId } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Kelimeyi öğrenildi olarak işaretle
    await Category.findOneAndUpdate(
      { userId, wordId },
      {
        $set: {
          categoryName: 'Öğrendiğim Kelimeler',
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    // Öğrenilen kelime sayısını güncelle
    user.learnedWordsCount = (user.learnedWordsCount || 0) + 1;
    await user.save();

    res.json({
      message: 'Kelime öğrenildi olarak işaretlendi',
      learnedWordsCount: user.learnedWordsCount
    });
  } catch (error) {
    console.error('Kelime güncelleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Günlük seri güncelleme endpoint'i
app.post('/api/streak/update', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    const lastActivityDate = user.lastActivityDate || new Date(0);
    const today = new Date();

    // Son aktivite tarihi bugün değilse seriyi artır
    if (lastActivityDate.toDateString() !== today.toDateString()) {
      user.dailyStreak = (user.dailyStreak || 0) + 1;
      user.lastActivityDate = today;
      await user.save();
    }

    res.json({
      message: 'Günlük seri güncellendi',
      dailyStreak: user.dailyStreak
    });
  } catch (error) {
    console.error('Seri güncelleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Sağlık kontrolü endpoint'i
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint bulunamadı' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Sunucu hatası:', err);
  res.status(500).json({
    message: 'Sunucu hatası',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Bir hata oluştu'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});

module.exports = app;