const BorrowedBookModel = require("../models/Borrowedbook.model");
const BookModel = require("../models/Book.model");

class BorrowController {
  // Borrow a book (Student only)
  static borrowBook(req, res) {
    const studentId = req.user.id; // From auth middleware
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({ message: "Book ID is required" });
    }

    // Check if book is available
    BookModel.findById(bookId, (err, books) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      if (!books.length) {
        return res.status(404).json({ message: "Book not found" });
      }

      const book = books[0];
      if (book.AvailableQuantity <= 0) {
        return res.status(400).json({ message: "Book is not available" });
      }

      // Calculate due date (14 days from now)
      const borrowDate = new Date().toISOString().split('T')[0];
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);
      const dueDateStr = dueDate.toISOString().split('T')[0];

      const borrowData = {
        studentId,
        bookId,
        borrowDate,
        dueDate: dueDateStr
      };

      // Create borrow record
      BorrowedBookModel.create(borrowData, (err2, result) => {
        if (err2) {
          return res.status(500).json({ message: err2.message });
        }

        // Update book quantity
        BookModel.updateQuantity(bookId, -1, (err3) => {
          if (err3) {
            return res.status(500).json({ message: err3.message });
          }

          res.status(201).json({ 
            message: "Book borrowed successfully", 
            borrowId: result.insertId,
            dueDate: dueDateStr
          });
        });
      });
    });
  }

  // Get student's borrowed books
  static getMyBorrowedBooks(req, res) {
    const studentId = req.user.id;

    BorrowedBookModel.getByStudent(studentId, (err, books) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      res.json(books);
    });
  }

  // Get all borrowed books (Librarian only)
  static getAllBorrowedBooks(req, res) {
    BorrowedBookModel.getAll((err, books) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      res.json(books);
    });
  }

  // Return a book (Librarian only)
  static returnBook(req, res) {
    const { borrowId } = req.params;
    const returnDate = new Date().toISOString().split('T')[0];

    // Get borrow details to calculate fine
    const sql = "SELECT * FROM BorrowedBook WHERE BorrowID = ?";
    require("../config/database").query(sql, [borrowId], (err, rows) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      if (!rows.length) {
        return res.status(404).json({ message: "Borrow record not found" });
      }

      const borrow = rows[0];
      const dueDate = new Date(borrow.DueDate);
      const returnDateObj = new Date(returnDate);
      
      // Calculate fine (₹10 per day overdue)
      let fine = 0;
      if (returnDateObj > dueDate) {
        const daysLate = Math.ceil((returnDateObj - dueDate) / (1000 * 60 * 60 * 24));
        fine = daysLate * 10;
      }

      // Update borrow record
      BorrowedBookModel.returnBook(borrowId, returnDate, fine, (err2) => {
        if (err2) {
          return res.status(500).json({ message: err2.message });
        }

        // Update book quantity
        BookModel.updateQuantity(borrow.BookID, 1, (err3) => {
          if (err3) {
            return res.status(500).json({ message: err3.message });
          }

          res.json({ 
            message: "Book returned successfully", 
            fine: fine 
          });
        });
      });
    });
  }
}

module.exports = BorrowController;