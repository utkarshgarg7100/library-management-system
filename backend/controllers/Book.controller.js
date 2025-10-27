const BookModel = require("../models/Book.model");

class BookController {
  // Get all books
  static getAllBooks(req, res) {
    BookModel.getAll((err, books) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      res.json(books);
    });
  }

  // Get available books
  static getAvailableBooks(req, res) {
    BookModel.getAvailable((err, books) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      res.json(books);
    });
  }

  // Get book by ID
  static getBookById(req, res) {
    const bookId = req.params.id;
    BookModel.findById(bookId, (err, books) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      if (!books.length) {
        return res.status(404).json({ message: "Book not found" });
      }
      res.json(books[0]);
    });
  }

  // Add new book (Librarian only)
  static addBook(req, res) {
    const { title, author, isbn, category, quantity } = req.body;

    if (!title || !author || !quantity) {
      return res.status(400).json({ message: "Title, author, and quantity are required" });
    }

    const bookData = { title, author, isbn, category, quantity };

    BookModel.create(bookData, (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ message: "ISBN already exists" });
        }
        return res.status(500).json({ message: err.message });
      }
      res.status(201).json({ 
        message: "Book added successfully", 
        bookId: result.insertId 
      });
    });
  }

  // Delete book (Librarian only)
  static deleteBook(req, res) {
    const bookId = req.params.id;

    BookModel.delete(bookId, (err, result) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Book not found" });
      }
      res.json({ message: "Book deleted successfully" });
    });
  }
}

module.exports = BookController;