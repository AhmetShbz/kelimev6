const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Mongoose kullanıcı modelini doğru yolu vererek dahil edin
const mongoose = require('mongoose');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
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
      });
      await user.save();

      res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu' });
    } catch (error) {
      console.error('Kayıt hatası:', error);
      res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
  } else {
    res.status(408).json({ message: 'Method Not Allowed' });
  }
};
