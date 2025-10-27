const db = require("../config/database");

class BorrowedBookModel {
  // Borrow a book
  static create(borrowData, callback) {
    const sql = "INSERT INTO BorrowedBook (StudentID, BookID, BorrowDate, DueDate, Status) VALUES (?, ?, ?, ?, 'Borrowed')";
    db.query(sql, [borrowData.studentId, borrowData.bookId, borrowData.borrowDate, borrowData.dueDate], callback);
  }

  // Get student's borrowed books
  static getByStudent(studentId, callback) {
    const sql = `
      SELECT bb.*, b.Title, b.Author, b.ISBN 
      FROM BorrowedBook bb 
      JOIN Book b ON bb.BookID = b.BookID 
      WHERE bb.StudentID = ? 
      ORDER BY bb.BorrowDate DESC
    `;
    db.query(sql, [studentId], callback);
  }

  // Get all borrowed books (for librarian)
  static getAll(callback) {
    const sql = `
      SELECT bb.*, b.Title, b.Author, s.Name as StudentName, s.Email as StudentEmail
      FROM BorrowedBook bb 
      JOIN Book b ON bb.BookID = b.BookID 
      JOIN Student s ON bb.StudentID = s.StudentID 
      ORDER BY bb.BorrowDate DESC
    `;
    db.query(sql, callback);
  }

  // Return a book
  static returnBook(borrowId, returnDate, fine, callback) {
    const sql = "UPDATE BorrowedBook SET ReturnDate = ?, Status = 'Returned', Fine = ? WHERE BorrowID = ?";
    db.query(sql, [returnDate, fine, borrowId], callback);
  }
}

module.exports = BorrowedBookModel;