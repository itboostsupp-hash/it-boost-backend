const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { _id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Admin verification
const verifyAdmin = async (req, res, next) => {
  await authenticate(req, res, async () => {
    try {
      const user = await User.findById(req.user._id);
       
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: 'Admin access required' });
      }
      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });
};

module.exports = { authenticate, verifyAdmin };
