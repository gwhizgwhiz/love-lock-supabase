// src/pages/SignUp.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import supabase from '../supabaseClient';
import signupImg from '../assets/signup_img.png';
import '../App.css';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [phase, setPhase] = useState('form'); // 'form' or 'verify'
  const navigate = useNavigate();
  const [name, setName] = useState('');


  const handleSignUp = async (e) => {
  e.preventDefault();
  setError(null);
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        redirectTo: `${window.location.origin}/verify-email`,
        data: { name }  // 👈 Still passing name
      },
    });

    if (error) throw error;

    console.log('✅ Signup successful. User ID:', data?.user?.id); // 👈 Add this line

    setPhase('verify');
  } catch (err) {
    setError(err.message || 'An unexpected error occurred.');
  }
};

  if (phase === 'verify') {
    return (
      <div className="login-container signup-page">
        <div className="login-form">
          <h1>Check Your Email</h1>
          <p>
            A confirmation link was sent to <strong>{email}</strong>.<br />
            Click it to confirm your account, then <Link to="/login">log in</Link>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container signup-page">
      <div className="login-image">
        <img src={signupImg} alt="Sign Up Illustration" className="login-img" />
      </div>
      <div className="login-form">
        <h1>Sign Up</h1>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSignUp}>
          <label>
            Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <div className="input-group">
            <label>Email:</label>
            <input
              type="email"
              autoComplete="email"
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
              autoComplete="new-password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn">Sign Up</button>
        </form>
        <p className="signup-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
