const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact"); // MongoDB model
const { verifyAdmin } = require("../middleware/authMiddleware");

// POST /api/contact
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ message: "All fields are required" });

    const newMessage = new Contact({ name, email, message });
    await newMessage.save();

    return res.json({ message: "Your message has been sent successfully!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /api/contact (Admin only)
router.get("/", verifyAdmin, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
