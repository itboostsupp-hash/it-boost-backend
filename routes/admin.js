const express = require("express");
const router = express.Router();
const { verifyAdmin } = require('../middleware/authMiddleware');
const Order = require("../models/Order");
const User = require("../models/User");
const Recharge = require("../models/Recharge");


// Get all orders
router.get("/order", verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email");
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update order status
router.put("/update-status/:id", verifyAdmin, async (req, res) => {
  const { status } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();
    res.json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add balance to user
router.post("/add-balance", verifyAdmin, async (req, res) => {
  const { email, amount } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.balance = (user.balance || 0) + amount;

     user.lastRecharge = { amount, date: new Date() };  
    await user.save();
    await Recharge.create({ user: user._id, amount });

    res.json({ message: "Balance updated", balance: user.balance, lastRecharge: user.lastRecharge, });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/recent-recharges", verifyAdmin, async (req, res) => {
  try {
    const recharges = await Recharge.find()
      .populate("user", "name email")
      .sort({ date: -1 })
      .limit(20);
    res.json(recharges);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
