import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Signup.css";

export default function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError("Name, email, and password are required");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const endpoint = role === "student" 
        ? "http://localhost:8080/api/auth/register/student"
        : "http://localhost:8080/api/auth/register/librarian";

      const requestData = role === "student" 
        ? {
            name: formData.name,
            email: formData.email,
            contact: formData.contact || null,
            password: formData.password
          }
        : {
            name: formData.name,
            email: formData.email,
            password: formData.password
          };

      const response = await axios.post(endpoint, requestData);

      setSuccess(`${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully! Redirecting to login...`);
      
      // Store token and user info
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userName", response.data.name);
      localStorage.setItem("userRole", response.data.role);

      // Redirect after a short delay
      setTimeout(() => {
        if (response.data.role === "student") {
          navigate("/student");
        } else if (response.data.role === "librarian") {
          navigate("/librarian");
        }
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
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
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-left">
          <div className="branding">
            <div className="logo-large">
              <span className="logo-icon-large">📚</span>
              <h1>LIBRARY MS</h1>
            </div>
            <p className="tagline">Join Our Library Community</p>
            <div className="features">
              <div className="feature-item">
                <span className="feature-icon">✅</span>
                <span>Easy Registration</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✅</span>
                <span>Instant Access</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✅</span>
                <span>Secure Platform</span>
              </div>
            </div>
          </div>
        </div>

        <div className="signup-right">
          <div className="signup-card">
            <div className="signup-header">
              <h2>Create Account</h2>
              <p>Join our library management system</p>
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

            {success && (
              <div className="success-alert">
                <span className="success-icon">✅</span>
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="signup-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

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

              {role === "student" && (
                <div className="form-group">
                  <label htmlFor="contact">Contact Number (Optional)</label>
                  <input
                    type="tel"
                    id="contact"
                    name="contact"
                    placeholder="Enter your contact number"
                    value={formData.contact}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Create a password (min 6 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <button type="submit" className="signup-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            <div className="login-link">
              <p>Already have an account? 
                <button 
                  type="button" 
                  className="link-btn"
                  onClick={() => navigate("/login")}
                >
                  Login here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
