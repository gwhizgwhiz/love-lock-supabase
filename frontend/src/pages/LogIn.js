// src/pages/LogIn.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import loginImg from '../assets/login_img.jpg';
import { Link } from 'react-router-dom';
import '../App.css';

export default function LogIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!user.email_confirmed_at) {
        navigate('/verify-email');
        return;
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-image">
        <img src={loginImg} alt="Login Illustration" className="login-img" />
      </div>
      <div className="login-form">
        <h1>Log In</h1>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email:</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Password:</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn">Log In</button>
        </form>
        <p className="signup-link">
          Don’t have an account? <Link to="/signup">Sign up</Link>
        </p>
        <p className="signup-link">
          Forgot your password? <Link to="/forgot-password">Reset it here</Link>
        </p>
      </div>
    </div>
  );
}
