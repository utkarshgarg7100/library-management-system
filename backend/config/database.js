const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME || "librarydb",
  port: process.env.DB_PORT || 3306
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    
  } else {
    console.log("✅ Connected to MySQL Database:", process.env.DB_NAME || "librarydb");
  }
});

module.exports = db;