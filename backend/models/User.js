const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: null },
  learnedWordsCount: { type: Number, default: 0 },
  dailyStreak: { type: Number, default: 0 },
  isAdmin: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', UserSchema);