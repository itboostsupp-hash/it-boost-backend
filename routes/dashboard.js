// routes/dashboard.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware'); // ✅ use default export
const User = require('../models/User');
const Order = require('../models/Order');

router.get('/profile', authenticate, async (req, res) => {
  try {
    // Safely get user ID from req.user
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found' });
    }

    // Fetch user, exclude password and __v
    const user = await User.findById(userId).select('-password -__v');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch orders
    const orders = await Order.find({ user: user._id }).select('-__v').sort({ createdAt: -1 });

    // Prepare response for frontend
    res.json({
      user: {
        id: user._id,
        name: user.name,
        balance: user.balance || 0,
        lastRecharge: user.lastRecharge || null,
      },
      orders: orders.map(order => ({
        _id: order._id,
        service: order.service,
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
