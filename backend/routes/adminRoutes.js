const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Admin kaydı
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Kullanıcı zaten var mı kontrol et
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu kullanıcı adı veya email zaten kullanımda' });
    }

    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni admin kullanıcısı oluştur
    const user = new User({ username, email, password: hashedPassword, isAdmin: true });
    await user.save();

    res.status(201).json({ message: 'Admin kullanıcısı başarıyla oluşturuldu' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Admin girişi
router.post('/login', async (req, res) => {
  try {
    const { loginIdentifier, password } = req.body;

    // Kullanıcıyı e-posta veya kullanıcı adına göre bul
    const user = await User.findOne({
      $or: [{ email: loginIdentifier }, { username: loginIdentifier }]
    });

    if (!user || !user.isAdmin) {
      return res.status(400).json({ message: 'Geçersiz kimlik bilgileri veya yetkisiz erişim' });
    }

    // Şifreyi kontrol et
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Geçersiz kimlik bilgileri' });
    }

    // JWT token oluştur
    const token = jwt.sign({ userId: user._id, isAdmin: true }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      userId: user._id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Tüm kullanıcıları getir
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kullanıcı güncelle
router.put('/users/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kullanıcı sil
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Kullanıcı başarıyla silindi' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;