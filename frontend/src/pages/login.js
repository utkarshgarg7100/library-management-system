import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
        console.log("HBD")
      const response = await axios.post("http://localhost:8080/api/auth/login", {
        role: role,
        email: formData.email,
        password: formData.password
      });
      console.log("HA:", response)

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userName", response.data.name);
      localStorage.setItem("userRole", response.data.role);

      if (response.data.role === "student") {
        navigate("/student");
      } else if (response.data.role === "librarian") {
        navigate("/librarian");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="branding">
            <div className="logo-large">
              <span className="logo-icon-large">📚</span>
              <h1>LIBRARY MS</h1>
            </div>
            <p className="tagline">Modern Library Management System</p>
            <div className="features">
              <div className="feature-item">
                <span className="feature-icon">✅</span>
                <span>Easy Book Borrowing</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✅</span>
                <span>Track Your Books</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✅</span>
                <span>24/7 Access</span>
              </div>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-card">
            <div className="login-header">
              <h2>Welcome Back</h2>
              <p>Login to access your dashboard</p>
            </div>

            <div className="role-selector">
              <button
                type="button"
                className={`role-btn ${role === "student" ? "active" : ""}`}
                onClick={() => setRole("student")}
              >
                <span className="role-icon">👤</span>
                <span>Student</span>
              </button>
              <button
                type="button"
                className={`role-btn ${role === "librarian" ? "active" : ""}`}
                onClick={() => setRole("librarian")}
              >
                <span className="role-icon">📖</span>
                <span>Librarian</span>
              </button>
            </div>

            {error && (
              <div className="error-alert">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            <div className="signup-link">
              <p>Don't have an account? 
                <button 
                  type="button" 
                  className="link-btn"
                  onClick={() => navigate("/signup")}
                >
                  Sign up here
                </button>
              </p>
            </div>

            <div className="demo-credentials">
              <p className="demo-title">Test Accounts:</p>
              <div className="demo-list">
                <div className="demo-item">
                  <strong>Student:</strong> student@test.com / student123
                </div>
                <div className="demo-item">
                  <strong>Librarian:</strong> librarian@test.com / librarian123
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}