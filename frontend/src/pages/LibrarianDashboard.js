import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./LibrarianDashboard.css";

export default function LibrarianDashboard() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState("dashboard");
  const [books, setBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [librarianName, setLibrarianName] = useState("Librarian");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const name = localStorage.getItem("userName") || "Librarian";
    setLibrarianName(name);

    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [booksRes, borrowedRes] = await Promise.all([
        api.get("/books/all"),
        api.get("/borrow/all")
      ]);
      setBooks(booksRes.data);
      setBorrowedBooks(borrowedRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/");
  };

  return (
    <div className="librarian-layout">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        logout={logout} 
        librarianName={librarianName} 
      />
      
      <main className="main-content">
        <TopHeader librarianName={librarianName} />
        
        <div className="content-wrapper">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              {currentView === "dashboard" && (
                <Overview books={books} borrowedBooks={borrowedBooks} />
              )}
              {currentView === "books" && (
                <ManageBooks books={books} reload={loadData} />
              )}
              {currentView === "issued" && (
                <IssuedBooks borrowedBooks={borrowedBooks} reload={loadData} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// ========== SIDEBAR ==========
function Sidebar({ currentView, setCurrentView, logout, librarianName }) {
  const menuItems = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "books", icon: "📚", label: "Manage Books" },
    { id: "issued", icon: "📖", label: "Issued Books" }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">📚</span>
          <span className="logo-text">LIBRARY MS</span>
        </div>
        <div className="librarian-badge">LIBRARIAN</div>
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
            {librarianName.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <div className="user-name">{librarianName}</div>
            <div className="user-role">Librarian</div>
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
function TopHeader({ librarianName }) {
  return (
    <header className="top-header">
      <div className="header-left">
        <h2>Librarian Dashboard</h2>
      </div>
      <div className="header-right">
        <button className="notification-btn">
          🔔
          <span className="badge">3</span>
        </button>
      </div>
    </header>
  );
}

// ========== DASHBOARD OVERVIEW ==========
function Overview({ books, borrowedBooks }) {
  const totalBooks = books.reduce((sum, book) => sum + book.TotalQuantity, 0);
  const availableBooks = books.reduce((sum, book) => sum + book.AvailableQuantity, 0);
  const issuedBooks = borrowedBooks.filter(b => b.Status === "Borrowed").length;
  const overdueBooks = borrowedBooks.filter(b => {
    if (b.Status !== "Borrowed") return false;
    return new Date(b.DueDate) < new Date();
  }).length;

  const stats = [
    { icon: "📚", title: "Total Books", value: totalBooks, color: "#667eea" },
    { icon: "✅", title: "Available", value: availableBooks, color: "#10b981" },
    { icon: "📖", title: "Currently Issued", value: issuedBooks, color: "#3b82f6" },
    { icon: "⏰", title: "Overdue", value: overdueBooks, color: "#ef4444" }
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

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h2>📋 Recent Activity</h2>
        </div>
        <div className="card-body">
          <div className="activity-list">
            {borrowedBooks.slice(0, 5).map((borrow) => (
              <div key={borrow.BorrowID} className="activity-item">
                <span className="activity-icon">📖</span>
                <div className="activity-content">
                  <p><strong>{borrow.StudentName}</strong> borrowed <strong>{borrow.Title}</strong></p>
                  <span className="activity-time">{formatDate(borrow.BorrowDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== MANAGE BOOKS ==========
function ManageBooks({ books, reload }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBooks = books.filter(book =>
    book.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.Author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    
    try {
      await api.delete(`/books/${bookId}`);
      alert("Book deleted successfully");
      reload();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete book");
    }
  };

  return (
    <div className="books-container">
      <div className="page-header">
        <h1 className="page-title">📚 Manage Books</h1>
        <div className="header-actions">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="primary-btn" onClick={() => setShowAddForm(true)}>
            ➕ Add New Book
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body no-padding">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>ISBN</th>
                <th>Category</th>
                <th>Total</th>
                <th>Available</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book.BookID}>
                  <td>{book.Title}</td>
                  <td>{book.Author}</td>
                  <td>{book.ISBN}</td>
                  <td>
                    <span className="category-badge">{book.Category}</span>
                  </td>
                  <td>{book.TotalQuantity}</td>
                  <td>
                    <span className={book.AvailableQuantity > 0 ? "available-text" : "unavailable-text"}>
                      {book.AvailableQuantity}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="action-btn-small delete"
                      onClick={() => handleDeleteBook(book.BookID)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddForm && (
        <AddBookModal onClose={() => setShowAddForm(false)} reload={reload} />
      )}
    </div>
  );
}

// ========== ISSUED BOOKS ==========
function IssuedBooks({ borrowedBooks, reload }) {
  const [filter, setFilter] = useState("all");

  const filteredBooks = filter === "all" 
    ? borrowedBooks 
    : borrowedBooks.filter(b => b.Status.toLowerCase() === filter);

  const handleReturnBook = async (borrowId) => {
    if (!window.confirm("Mark this book as returned?")) return;

    try {
      const response = await api.put(`/borrow/return/${borrowId}`);
      alert(`Book returned successfully! Fine: ₹${response.data.fine}`);
      reload();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to return book");
    }
  };

  return (
    <div className="issued-container">
      <div className="page-header">
        <h1 className="page-title">📖 Issued Books</h1>
        <div className="filter-tabs">
          {["all", "borrowed", "returned", "overdue"].map(f => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-body no-padding">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Book Title</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Status</th>
                <th>Fine</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((borrow) => (
                <tr key={borrow.BorrowID}>
                  <td>{borrow.StudentName}</td>
                  <td>{borrow.Title}</td>
                  <td>{formatDate(borrow.BorrowDate)}</td>
                  <td>{formatDate(borrow.DueDate)}</td>
                  <td>{borrow.ReturnDate ? formatDate(borrow.ReturnDate) : "-"}</td>
                  <td>
                    <span className={`status-badge ${borrow.Status.toLowerCase()}`}>
                      {borrow.Status}
                    </span>
                  </td>
                  <td>₹{borrow.Fine || 0}</td>
                  <td>
                    {borrow.Status === "Borrowed" && (
                      <button 
                        className="action-btn-small"
                        onClick={() => handleReturnBook(borrow.BorrowID)}
                      >
                        Return
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ========== ADD BOOK MODAL ==========
function AddBookModal({ onClose, reload }) {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    quantity: 1
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/books/add", formData);
      alert("Book added successfully!");
      reload();
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add book");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Book</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Author</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({...formData, author: e.target.value})}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>ISBN</label>
              <input
                type="text"
                value={formData.isbn}
                onChange={(e) => setFormData({...formData, isbn: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add Book
            </button>
          </div>
        </form>
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