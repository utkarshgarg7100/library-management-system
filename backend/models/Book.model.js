const db = require("../config/database");

class BookModel {
  // Get all books
  static getAll(callback) {
    const sql = "SELECT * FROM Book ORDER BY Title";
    db.query(sql, callback);
  }

  // Get available books
  static getAvailable(callback) {
    const sql = "SELECT * FROM Book WHERE AvailableQuantity > 0 ORDER BY Title";
    db.query(sql, callback);
  }

  // Get book by ID
  static findById(id, callback) {
    const sql = "SELECT * FROM Book WHERE BookID = ?";
    db.query(sql, [id], callback);
  }

  // Create new book
  static create(bookData, callback) {
    const sql = "INSERT INTO Book (Title, Author, ISBN, Category, TotalQuantity, AvailableQuantity) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [bookData.title, bookData.author, bookData.isbn, bookData.category, bookData.quantity, bookData.quantity], callback);
  }

  // Update book quantity
  static updateQuantity(bookId, quantityChange, callback) {
    const sql = "UPDATE Book SET AvailableQuantity = AvailableQuantity + ? WHERE BookID = ?";
    db.query(sql, [quantityChange, bookId], callback);
  }

  // Delete book
  static delete(id, callback) {
    const sql = "DELETE FROM Book WHERE BookID = ?";
    db.query(sql, [id], callback);
  }
}

module.exports = BookModel;