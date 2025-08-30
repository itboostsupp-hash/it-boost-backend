const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();

app.use(cors({
  origin: ["https://itzboost.com", "https://www.itzboost.com"], // ya jo bhi tumhara frontend URL hai
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const balanceRoutes = require("./routes/balance");
app.use("/api/balance", balanceRoutes);

const orderRoutes = require("./routes/order");
app.use("/api/order", orderRoutes);

const contactRoutes = require("./routes/contact");
app.use("/api/contact", contactRoutes);

const dashboardRoutes = require("./routes/dashboard");
app.use("/api/dashboard", dashboardRoutes);

const userRoutes = require('./routes/user');
app.use('/api/user', userRoutes);

const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);

const reviewRoutes = require("./routes/review");
app.use("/api/review", reviewRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error(err));

const PORT = process.env.PORT || 5000;
// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
