#!/usr/bin/env node
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
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

// Kullanıcı modeli
const User = mongoose.model('User', require('../models/User').schema);

// JWT doğrulama middleware'i
const authenticateToken = require('../middlewares/authMiddleware');

// Admin middleware'i
const adminMiddleware = require('../middlewares/adminMiddleware');

// Admin route'ları
const adminRoutes = require('../routes/adminRoutes');
app.use('/api/admin', adminRoutes);

// Normal kullanıcı kayıt endpoint'i
app.get('/api/register', async (req, res) => {
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
    const user = new User({ username, email, password: hashedPassword, isAdmin: false });
    await user.save();

    res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu' });
  } catch (error) {
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

    if (user.isAdmin) {
      return res.status(403).json({ message: 'Bu giriş yöntemi sadece normal kullanıcılar içindir' });
    }

    // Şifreyi kontrol et
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Geçersiz kimlik bilgileri' });
    }

    // JWT token oluştur
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

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
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Kullanıcı bilgilerini güncelleme endpoint'i
app.put('/api/user', authenticateToken, async (req, res) => {
  try {
    const { userId, currentPassword, newPassword, newEmail, profileImage } = req.body;

    // Token'daki kullanıcı ID'si ile gönderilen ID'nin eşleştiğini kontrol et
    if (req.user.userId !== userId) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
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

    // Yeni şifre varsa güncelle
    if (newPassword) {
      user.password = await bcrypt.hash(newPassword, 10);
    }

    // Yeni email varsa güncelle
    if (newEmail && newEmail !== user.email) {
      // E-posta adresinin benzersiz olduğunu kontrol et
      const existingUser = await User.findOne({ email: newEmail });
      if (existingUser) {
        return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanımda' });
      }
      user.email = newEmail;
    }

    // Profil fotoğrafı varsa güncelle
    if (profileImage) {
      user.profileImage = profileImage;
    }

    await user.save();

    res.json({
      message: 'Kullanıcı bilgileri başarıyla güncellendi',
      user: {
        userId: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        learnedWordsCount: user.learnedWordsCount,
        dailyStreak: user.dailyStreak,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Kullanıcı güncelleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Kullanıcı bilgilerini getirme endpoint'i
app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

module.exports = app;