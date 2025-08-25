const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Order = require("../models/Order");

// ✅ Import middlewares
const { authenticate, verifyAdmin } = require('../middleware/authMiddleware'); // combined middleware

// ------------------------
// USER ROUTES
// ------------------------

// Place an order (User)
router.post("/place", authenticate, async (req, res) => {
  const { service, quantity, price, link, platform } = req.body;
  const userId = req.user._id;

  if (!service || !quantity || !price || !link || !platform) {
    return res.status(400).json({ message: "Please provide all required fields" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.balance < price) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Deduct balance
    user.balance -= price;
    await user.save();

    const order = new Order({
      user: userId,
      platform,
      service,
      link,
      quantity,
      price,
      status: "pending"
    });

    await order.save();
    res.json({ message: "Order placed successfully", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's orders
router.get("/my-orders", authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------
// ADMIN ROUTES
// ------------------------

// Get all orders
router.get("/all", verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update order status
router.put("/update-status/:orderId", verifyAdmin, async (req, res) => {
  const { status } = req.body;
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add balance to a user
router.post("/add-balance", verifyAdmin, async (req, res) => {
  const { email, amount } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.balance = (user.balance || 0) + amount;
    await user.save();
    res.json({ message: "Balance updated", balance: user.balance });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
