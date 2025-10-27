import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./StudentDashboard.css";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState("dashboard");
  const [books, setBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("Student");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const name = localStorage.getItem("userName") || "Student";
    setStudentName(name);

    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [booksRes, borrowedRes] = await Promise.all([
        api.get("/books/available"),
        api.get("/borrow/my")
      ]);
      setBooks(booksRes.data);
      setBorrowedBooks(borrowedRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrowBook = async (bookId) => {
    try {
      await api.post("/borrow/borrow", { bookId });
      alert("Book borrowed successfully! Due date: 14 days from today");
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to borrow book");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/");
  };

  return (
    <div className="student-layout">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        logout={logout} 
        studentName={studentName} 
      />
      
      <main className="main-content">
        <TopHeader studentName={studentName} />
        
        <div className="content-wrapper">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              {currentView === "dashboard" && (
                <Overview books={books} borrowedBooks={borrowedBooks} />
              )}
              {currentView === "browse" && (
                <BrowseBooks 
                  books={books} 
                  onBorrow={handleBorrowBook}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                />
              )}
              {currentView === "borrowed" && (
                <MyBooks borrowedBooks={borrowedBooks} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// ========== SIDEBAR ==========
function Sidebar({ currentView, setCurrentView, logout, studentName }) {
  const menuItems = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "browse", icon: "📚", label: "Browse Books" },
    { id: "borrowed", icon: "📖", label: "My Books" }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">📚</span>
          <span className="logo-text">LIBRARY MS</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${currentView === item.id ? "active" : ""}`}
            onClick={() => setCurrentView(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            {studentName.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <div className="user-name">{studentName}</div>
            <div className="user-role">Student</div>
          </div>
        </div>
        <button className="logout-btn" onClick={logout}>
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}

// ========== TOP HEADER ==========
function TopHeader({ studentName }) {
  return (
    <header className="top-header">
      <div className="header-left">
        <h2>Welcome back, {studentName}!</h2>
      </div>
      <div className="header-right">
        <button className="notification-btn">
          🔔
          <span className="badge">2</span>
        </button>
      </div>
    </header>
  );
}

// ========== DASHBOARD OVERVIEW ==========
function Overview({ books, borrowedBooks }) {
  const activeBorrows = borrowedBooks.filter(b => b.Status === "Borrowed").length;
  const overdue = borrowedBooks.filter(b => {
    if (b.Status !== "Borrowed") return false;
    return new Date(b.DueDate) < new Date();
  }).length;

  const stats = [
    { icon: "📚", title: "Available Books", value: books.length, color: "#667eea" },
    { icon: "📖", title: "Books Borrowed", value: activeBorrows, color: "#10b981" },
    { icon: "⏰", title: "Overdue", value: overdue, color: "#ef4444" },
    { icon: "✅", title: "Returned", value: borrowedBooks.filter(b => b.Status === "Returned").length, color: "#3b82f6" }
  ];

  return (
    <div className="overview-container">
      <h1 className="page-title">Dashboard Overview</h1>
      
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card" style={{ borderLeftColor: stat.color }}>
            <div className="stat-icon" style={{ background: `${stat.color}15` }}>
              <span>{stat.icon}</span>
            </div>
            <div className="stat-content">
              <div className="stat-title">{stat.title}</div>
              <div className="stat-value">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h2>📖 Currently Borrowed Books</h2>
        </div>
        <div className="card-body">
          {activeBorrows === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📚</span>
              <p>No books borrowed yet</p>
            </div>
          ) : (
            <div className="books-list">
              {borrowedBooks.filter(b => b.Status === "Borrowed").map((book) => (
                <div key={book.BorrowID} className="book-item">
                  <div className="book-info">
                    <h4>{book.Title}</h4>
                    <p>by {book.Author}</p>
                  </div>
                  <div className="book-due">
                    <span>Due: {formatDate(book.DueDate)}</span>
                    {new Date(book.DueDate) < new Date() && (
                      <span className="overdue-tag">Overdue</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== BROWSE BOOKS ==========
function BrowseBooks({ books, onBorrow, searchTerm, setSearchTerm }) {
  const filteredBooks = books.filter(book => 
    book.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.Author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="browse-container">
      <div className="page-header">
        <h1 className="page-title">📚 Browse Books</h1>
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="books-grid">
        {filteredBooks.map((book) => (
          <div key={book.BookID} className="book-card">
            <div className="book-cover">📕</div>
            <div className="book-details">
              <h3>{book.Title}</h3>
              <p className="book-author">by {book.Author}</p>
              <p className="book-category">{book.Category}</p>
              <div className="book-footer">
                <span className="book-available">
                  {book.AvailableQuantity} available
                </span>
                <button 
                  className="borrow-btn"
                  onClick={() => onBorrow(book.BookID)}
                  disabled={book.AvailableQuantity === 0}
                >
                  {book.AvailableQuantity > 0 ? "Borrow" : "Not Available"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ========== MY BOOKS ==========
function MyBooks({ borrowedBooks }) {
  return (
    <div className="mybooks-container">
      <h1 className="page-title">📖 My Borrowed Books</h1>

      <div className="card">
        <div className="card-body no-padding">
          <table className="data-table">
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Author</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Fine</th>
              </tr>
            </thead>
            <tbody>
              {borrowedBooks.map((book) => (
                <tr key={book.BorrowID}>
                  <td>{book.Title}</td>
                  <td>{book.Author}</td>
                  <td>{formatDate(book.BorrowDate)}</td>
                  <td>{formatDate(book.DueDate)}</td>
                  <td>
                    <span className={`status-badge ${book.Status.toLowerCase()}`}>
                      {book.Status}
                    </span>
                  </td>
                  <td>₹{book.Fine || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ========== HELPERS ==========
function LoadingSpinner() {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}