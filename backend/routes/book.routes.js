const express = require("express");
const router = express.Router();
const BookController = require("../controllers/Book.controller");
const auth = require("../middleware/auth");

// Public routes
router.get("/all", BookController.getAllBooks);
router.get("/available", BookController.getAvailableBooks);
router.get("/:id", BookController.getBookById);

// Librarian only routes
router.post("/add", auth(["librarian"]), BookController.addBook);
router.delete("/:id", auth(["librarian"]), BookController.deleteBook);

module.exports = router;