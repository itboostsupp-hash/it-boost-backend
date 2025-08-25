const express = require("express");
const router = express.Router();


const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Middleware - Authenticate user from token

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Access Denied. No Token Provided." });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // user info (id, role)
        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid Token" });
    }
};

// Middleware - Check admin role

const adminMiddleware = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access Denied. Admins Only." });
    }
    next();
};

// 📌 Get Current User Balance
router.get("/my-balance", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("balance name email");
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// 📌 Admin: Add Balance to User
router.post("/add-balance", authMiddleware, adminMiddleware, async (req, res) => {
    const { userId, amount } = req.body;

    if (!userId || !amount) {
        return res.status(400).json({ message: "User ID and amount are required" });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.balance += amount;
        await user.save();

        res.json({ message: "Balance added successfully", user });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
