const db = require("../config/database");

class StudentModel {
  // Get student by email
  static findByEmail(email, callback) {
    const sql = "SELECT * FROM Student WHERE Email = ?";
    db.query(sql, [email], callback);
  }

  // Create new student
  static create(studentData, callback) {
    const sql = "INSERT INTO Student (Name, Email, Contact, Password) VALUES (?, ?, ?, ?)";
    db.query(sql, [studentData.name, studentData.email, studentData.contact, studentData.password], callback);
  }

  // Get student by ID
  static findById(id, callback) {
    const sql = "SELECT StudentID, Name, Email, Contact, CreatedAt FROM Student WHERE StudentID = ?";
    db.query(sql, [id], callback);
  }

  // Get all students
  static getAll(callback) {
    const sql = "SELECT StudentID, Name, Email, Contact, CreatedAt FROM Student ORDER BY CreatedAt DESC";
    db.query(sql, callback);
  }
}

module.exports = StudentModel;