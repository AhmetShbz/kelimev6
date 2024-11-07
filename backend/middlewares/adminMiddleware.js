const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Admin yetkisi gerekiyor' });
  }
};

module.exports = adminMiddleware;