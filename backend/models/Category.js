// models/Category.js
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Word', required: true },
  categoryName: {
    type: String,
    enum: ['Öğrendiğim Kelimeler', 'Zorlandığım Kelimeler', 'Tekrar Edilecek Kelimeler'],
    required: true
  },
  addedAt: { type: Date, default: Date.now }
});

// Bir kullanıcı bir kelimeyi sadece bir kategoride tutabilir
CategorySchema.index({ userId: 1, wordId: 1 }, { unique: true });

module.exports = mongoose.model('Category', CategorySchema);