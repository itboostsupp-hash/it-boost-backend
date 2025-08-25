// routes/user.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const Order = require('../models/Order'); 
const { authenticate } = require('../middleware/authMiddleware');
 // ✅ fixed import

router.get('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user?._id; // instead of req.user?.id

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found' });
    }

    const user = await User.findById(userId).select('-password -__v');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const orders = await Order.find({ userId }).select('-__v').sort({ createdAt: -1 });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance || 0,
        lastRecharge: user.lastRecharge || 0,
      },
      orders: orders.map(order => ({
        _id: order._id,
        serviceName: order.serviceName,
        quantity: order.quantity,
        status: order.status,
        createdAt: order.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

module.exports = router;
