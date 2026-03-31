import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSuccess("Login successful!");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="minimal-auth-form">
      <h2 className="simple-title">Welcome Back</h2>
      <p className="simple-subtitle">Securely access your digital legacy. Your assets await.</p>

      <div className="clean-input-group">
        <input
          className="clean-input"
          type="email"
          placeholder=" "
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label className="clean-label">Email</label>
      </div>

      <div className="clean-input-group">
        <div className="password-input-container">
          <input
            className="clean-input"
            type={showPassword ? "text" : "password"}
            placeholder=" "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label className="clean-label">Password</label>
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? "Hide" : "Show"}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
      </div>

      {error && <div className="auth-error">{error}</div>}
      {success && <div className="auth-success">{success}</div>}

      <button
        className="professional-btn"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading && <span className="loading-spinner"></span>}
        {loading ? "Logging in..." : "Login"}
      </button>

      <p>
        Don't have an account?
        <a href="/signup" className="simple-link"> Sign up</a>
      </p>
    </div>
  );
};

