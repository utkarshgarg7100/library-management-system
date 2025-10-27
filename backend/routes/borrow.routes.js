const express = require("express");
const router = express.Router();
const BorrowController = require("../controllers/Borrow.controller");
const auth = require("../middleware/auth");

// Student routes
router.post("/borrow", auth(["student"]), BorrowController.borrowBook);
router.get("/my", auth(["student"]), BorrowController.getMyBorrowedBooks);

// Librarian routes
router.get("/all", auth(["librarian"]), BorrowController.getAllBorrowedBooks);
router.put("/return/:borrowId", auth(["librarian"]), BorrowController.returnBook);

module.exports = router;