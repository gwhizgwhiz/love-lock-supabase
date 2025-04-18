// Inbox.js
import React, { useState, useEffect } from 'react';
import { useNavigate }            from 'react-router-dom';
import supabase                   from './supabaseClient';
import './App.css';               // your global + inbox styles

const Inbox = () => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState(null);
  const navigate              = useNavigate();

  // Fetch auth state on mount
  useEffect(() => {
    (async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) console.error(error);
      if (user) {
        setUser(user);
      } else {
        navigate('/login', { replace: true });
      }
      setLoading(false);
    })();
  }, [navigate]);

  // Login handler
  const handleLogin = async e => {
    e.preventDefault();
    setError(null);
    try {
      const { data: { user }, error } =
        await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setUser(user);
    } catch (err) {
      setError(err.message);
    }
  };

  // Sign‑up handler
  const handleSignUp = async e => {
    e.preventDefault();
    setError(null);
    try {
      const { data: { user }, error } =
        await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setUser(user);
    } catch (err) {
      setError(err.message);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    setUser(null);
    navigate('/login', { replace: true });
  };

  if (loading) {
    return <p>Loading user...</p>;
  }

  // Fallback: show login / signup
  if (!user) {
    return (
      <div className="login-container">
        <div className="login-form">
          <h1>Inbox Access</h1>
          {error && <p className="error-message">{error}</p>}

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="login-email">Email:</label>
              <input
                id="login-email"
                type="email"
                className="input-field"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="login-password">Password:</label>
              <input
                id="login-password"
                type="password"
                className="input-field"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn">
              Login
            </button>
          </form>

          <div className="signup-link">
            <p>Don't have an account?</p>
            <form onSubmit={handleSignUp}>
              <button type="submit" className="btn">
                Sign Up
              </button>
            </form>
          </div>
        </div>

        <div className="login-image">
          <img
            src="/path/to/your-inbox-fallback-image.png"
            alt="Welcome"
            className="login-img"
          />
        </div>
      </div>
    );
  }

  // Authenticated inbox
  return (
    <div className="inbox-container">
      <div className="inbox-card">
        <h1>Inbox</h1>
        <p>Welcome, {user.email}</p>

        <ul className="message-list">
          <li className="message-item">No messages yet.</li>
          {/* TODO: map over real messages here */}
        </ul>

        <div className="inbox-buttons">
          <button onClick={handleLogout} className="btn">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Inbox;
