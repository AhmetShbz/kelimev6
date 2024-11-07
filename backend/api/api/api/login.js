const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Mongoose kullanıcı modelini doğru yolu vererek dahil edin

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { loginIdentifier, password } = req.body;

      const user = await User.findOne({
        $or: [{ email: loginIdentifier }, { username: loginIdentifier }],
      });

      if (!user) {
        return res.status(400).json({ message: 'Kullanıcı bulunamadı' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Geçersiz şifre' });
      }

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
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
};
