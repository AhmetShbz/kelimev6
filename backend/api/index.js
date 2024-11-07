const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(cors());

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

// Kullanıcı modeli
const User = require('../models/User');

// JWT doğrulama middleware'i
const authenticateToken = require('../middlewares/authMiddleware');

// Admin middleware'i
const adminMiddleware = require('../middlewares/adminMiddleware');

// Admin route'ları
const adminRoutes = require('../routes/adminRoutes');
app.use('/api/admin', authenticateToken, adminMiddleware, adminRoutes);

// Normal kullanıcı kayıt endpoint'i
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
      isAdmin: false
    });
    await user.save();

    res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu' });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Normal kullanıcı giriş endpoint'i
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
      { userId: user._id, isAdmin: user.isAdmin },
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

// Kullanıcı bilgilerini güncelleme endpoint'i
app.put('/api/user', authenticateToken, async (req, res) => {
  try {
    const { userId, currentPassword, newPassword, newEmail, profileImage } = req.body;

    // Token'daki kullanıcı ID'si ile gönderilen ID'nin eşleştiğini kontrol et
    if (req.user.userId !== userId) {
      return res.status(403).json({ message: 'Yetkisiz erişim' });
    }

    const user = await User.findById(userId);
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
      userId,
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
    const { userId, wordId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Öğrenilen kelime sayısını artır
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
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Günlük seriyi artır
    user.dailyStreak = (user.dailyStreak || 0) + 1;
    await user.save();

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
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
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