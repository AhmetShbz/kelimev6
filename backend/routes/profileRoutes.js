// routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authenticateToken = require('../middlewares/authMiddleware');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Cloudinary konfigürasyonu
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer konfigürasyonu
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Profil bilgilerini getir
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    res.json(user);
  } catch (error) {
    console.error('Profil bilgileri getirilirken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Profil bilgilerini güncelle
router.put('/', authenticateToken, upload.single('profileImage'), async (req, res) => {
  try {
    const { currentPassword, newPassword, newEmail } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Şifre kontrolü
    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Mevcut şifre yanlış' });
      }
    }

    // Güncellenecek alanlar
    const updates = {};

    // Yeni şifre varsa güncelle
    if (newPassword) {
      updates.password = await bcrypt.hash(newPassword, 10);
    }

    // Yeni email varsa güncelle
    if (newEmail && newEmail !== user.email) {
      const existingUser = await User.findOne({ email: newEmail });
      if (existingUser) {
        return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanımda' });
      }
      updates.email = newEmail;
    }

    // Profil fotoğrafı yükleme
    if (req.file) {
      try {
        // Base64'e çevir
        const base64File = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${base64File}`;

        // Cloudinary'ye yükle
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'profile_images',
          transformation: [
            { width: 500, height: 500, crop: "fill" },
            { quality: "auto" }
          ]
        });

        updates.profileImage = result.secure_url;

        // Eski resmi sil
        if (user.profileImage) {
          const oldPublicId = user.profileImage.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`profile_images/${oldPublicId}`);
        }
      } catch (uploadError) {
        console.error('Profil fotoğrafı yüklenirken hata:', uploadError);
        return res.status(500).json({ message: 'Profil fotoğrafı yüklenemedi' });
      }
    }

    // Kullanıcıyı güncelle
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profil başarıyla güncellendi',
      user: updatedUser
    });
  } catch (error) {
    console.error('Profil güncellenirken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// İstatistikleri güncelle
router.post('/stats', authenticateToken, async (req, res) => {
  try {
    const { learnedWordsCount, dailyStreak } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        $set: {
          learnedWordsCount,
          dailyStreak,
          lastActivityDate: new Date()
        }
      },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('İstatistikler güncellenirken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

module.exports = router;