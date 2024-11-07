// models/Word.js
const mongoose = require('mongoose');

const WordSchema = new mongoose.Schema({
  polish: { type: String, required: true, unique: true },
  turkish: { type: String, required: true },
  phonetic: { type: String },
  example: { type: String },
  translation: { type: String },
  difficulty: { type: String, enum: ['Kolay', 'Orta', 'Zor'], default: 'Orta' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Word', WordSchema);