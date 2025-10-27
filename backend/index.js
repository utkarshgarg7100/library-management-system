const express = require("express");
const cors = require("cors");
require("dotenv").config();

require("./config/database");

const authRoutes = require("./routes/auth.routes");
const bookRoutes = require("./routes/book.routes");
const borrowRoutes = require("./routes/borrow.routes");

const app = express();


// ✅ FIXED CORS CONFIGURATION
app.use(cors({
    origin: "*",
    credentials: true
  }));

// Handle preflight requests


app.use(express.json());
app.use(express.urlencoded({extended:true}))

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/borrow", borrowRoutes);

// Health check
app.get("/health", (req, res) => {
  return res.json({ status: "OK", message: "Library Management API is running" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});