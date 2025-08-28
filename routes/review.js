const express = require("express");
const router = express.Router();
const Review = require("../models/Review");

// ✅ Get all reviews
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Add new review
router.post("/", async (req, res) => {
  try {
    const { name, rating, comment } = req.body;
    if (!name || !rating || !comment) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const newReview = new Review({ name, rating, comment });
    await newReview.save();
    res.json(newReview);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
