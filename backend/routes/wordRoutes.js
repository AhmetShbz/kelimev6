// routes/wordRoutes.js
const express = require('express');
const router = express.Router();
const Word = require('../models/Word');
const Category = require('../models/Category');
const authenticateToken = require('../middlewares/authMiddleware');

// Tüm kelimeleri getir
router.get('/', authenticateToken, async (req, res) => {
  try {
    const words = await Word.find().sort({ createdAt: -1 });
    res.json(words);
  } catch (error) {
    console.error('Kelimeler getirilirken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Yeni kelime ekle (admin için)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { polish, turkish, phonetic, example, translation, difficulty } = req.body;

    const word = new Word({
      polish,
      turkish,
      phonetic,
      example,
      translation,
      difficulty
    });

    await word.save();
    res.status(201).json(word);
  } catch (error) {
    console.error('Kelime eklenirken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Kelimeyi kategoriye ekle/güncelle
router.post('/category', authenticateToken, async (req, res) => {
  try {
    const { wordId, categoryName } = req.body;
    const userId = req.user.userId;

    // Önce mevcut kategoriyi sil
    await Category.findOneAndDelete({ userId, wordId });

    // Yeni kategoriyi ekle
    const category = new Category({
      userId,
      wordId,
      categoryName
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error('Kategori güncellenirken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Kullanıcının kategorilerine göre kelimeleri getir
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const categories = await Category.find({ userId }).populate('wordId');

    // Kategorileri düzenle
    const categorizedWords = categories.reduce((acc, curr) => {
      if (!acc[curr.categoryName]) {
        acc[curr.categoryName] = [];
      }
      acc[curr.categoryName].push(curr.wordId);
      return acc;
    }, {});

    res.json(categorizedWords);
  } catch (error) {
    console.error('Kategoriler getirilirken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// CSV'den toplu kelime yükleme (admin için)
router.post('/bulk', authenticateToken, async (req, res) => {
  try {
    const { words } = req.body;
    const insertedWords = await Word.insertMany(words, { ordered: false });
    res.status(201).json(insertedWords);
  } catch (error) {
    console.error('Toplu kelime yüklenirken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

module.exports = router;