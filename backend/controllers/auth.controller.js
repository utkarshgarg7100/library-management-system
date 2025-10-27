const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");

// Helper: Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || "library_secret_key_2025", { expiresIn: "24h" });
};

class AuthController {
  // Register Student
  static registerStudent(req, res) {
    const { name, email, contact, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    const sql = "INSERT INTO Student (Name, Email, Contact, Password) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, email, contact || null, hashedPassword], (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ message: "Email already exists" });
        }
        return res.status(500).json({ message: err.message });
      }

      const token = generateToken({ id: result.insertId, role: "student" });
      res.status(201).json({ 
        message: "Student registered successfully", 
        token, 
        role: "student",
        id: result.insertId,
        name 
      });
    });
  }

  // Register Librarian
  static registerLibrarian(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const sql = "INSERT INTO Librarian (Name, Email, Password) VALUES (?, ?, ?)";
    db.query(sql, [name, email, hashedPassword], (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ message: "Email already exists" });
        }
        return res.status(500).json({ message: err.message });
      }

      const token = generateToken({ id: result.insertId, role: "librarian" });
      res.status(201).json({ 
        message: "Librarian registered successfully", 
        token, 
        role: "librarian",
        id: result.insertId,
        name 
      });
    });
  }

  // Login
  static login(req, res) {
    const { role, email, password } = req.body;

    if (!role || !email || !password) {
      return res.status(400).json({ message: "Role, email, and password are required" });
    }

    const table = role === "student" ? "Student" : "Librarian";
    const idCol = role === "student" ? "StudentID" : "LibrarianID";


    const sql = `SELECT * FROM ${table} WHERE Email = ? LIMIT 1`;
    db.query(sql, [email], async (err, rows) => {
      if (err) {

        return res.status(500).json({ message: err.message });
      }

      if (!rows.length) {

        return res.status(404).json({ message: "User not found" });
      }

      const user = rows[0];
      const isPasswordValid = await bcrypt.compare(password, user.Password);

   
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }


     

      const token = generateToken({ id: user[idCol], role });
      return res.status(200).json({ 
        token, 
        role, 
        id: user[idCol], 
        name: user.Name 
      });
    });
  }
}

module.exports = AuthController;