const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const { authenticate, verifyAdmin } = require("../middleware/authMiddleware"); 
const nodemailer = require("nodemailer");


// 👇 Nodemailer setup
const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  },
});

// 📌 Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

     // 👇 Welcome email
    const mailOptions = {
      from: `"ITZ Boost" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Welcome to ITZ BOOST!",
      html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background: #f0f8ff url('https://em-content.zobj.net/source/microsoft-teams/363/rocket_1f680.png') no-repeat top right; padding: 40px; color: #333;">
        
        <!-- Logo -->
        <div style="text-align: center; margin-bottom: 25px;">
          <img src="https://itzboost.com/logo192.png" alt="ITZ BOOST Logo" style="width: 130px; height: auto; filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.3));">
        </div>

        <!-- Header -->
        <h1 style="text-align: center; font-size: 30px; color: #007bff; margin-bottom: 15px;">
          🚀 Welcome to ITZ BOOST, ${user.name}!
        </h1>

        <!-- Subtitle -->
        <p style="text-align: center; font-size: 18px; color: #555; margin-bottom: 30px;">
          Skyrocket your social media presence with our smart and easy tools!
        </p>

        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 35px;">
          <a href="https://itzboost.com/login" 
             style="display: inline-block; padding: 14px 30px; font-size: 18px; font-weight: bold; color: #fff; background: linear-gradient(90deg, #28a745, #218838); text-decoration: none; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.2); transition: all 0.3s;">
             Login & Start Boosting
          </a>
        </div>

        <!-- Info Section -->
        <p style="text-align: center; font-size: 16px; color: #555; line-height: 1.6;">
          Your account is now ready. Explore our features and watch your social media accounts grow! <br>
          If you did not sign up for ITZ BOOST, please ignore this email.
        </p>

        <!-- Rocket Animation -->
        <div style="text-align: center; margin-top: 40px;">
          <img src="https://em-content.zobj.net/source/microsoft-teams/363/rocket_1f680.png" alt="Rocket" style="width: 80px; animation: rocketMove 4s infinite alternate;">
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 50px; font-size: 13px; color: #aaa;">
          © ${new Date().getFullYear()} ITZ BOOST. All rights reserved.<br>
          , Pakistan
        </div>

        <style>
          @keyframes rocketMove {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
            100% { transform: translateY(0px); }
          }
        </style>
      </div>
      `,
    };


    transporter.sendMail(mailOptions).catch(err => console.error("Email sending error:", err));

    res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 📌 Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, role:user.role }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        balance: user.balance,
        lastRecharge: user.lastRecharge || null
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Sirf Admin hi kisi user ka password change kar sake
router.post("/change-password/:userId", authenticate, verifyAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "New password required" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(req.params.userId, { password: hashedPassword });

    res.json({ message: "Password updated successfully by Admin" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
