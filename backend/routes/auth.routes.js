const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");

// Register routes
router.post("/register/student", AuthController.registerStudent);
router.post("/register/librarian", AuthController.registerLibrarian);

// Login route
router.post("/login", AuthController.login);

module.exports = router;