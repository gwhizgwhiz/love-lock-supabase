// SignUp.js
import React, { useState }      from 'react';
import { useNavigate }          from 'react-router-dom';
import supabase                 from './supabaseClient';
import signupImg                from './assets/signup_img.png';
import './App.css';

const SignUp = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState(null);
  const navigate                = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const { data: { user }, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      navigate('/');  // go to inbox on success
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container signup-page">
      {/* Left: Signup Image */}
      <div className="login-image">
        <img src={signupImg} alt="Sign Up Illustration" className="login-img" />
      </div>

      {/* Right: Sign Up Form */}
      <div className="login-form">
        <h1>Sign Up</h1>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSignUp}>
          <div className="input-group">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              className="input-field"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              className="input-field"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn">
            Sign Up
          </button>
        </form>

        <p className="signup-link">
          Already have an account? <a href="/login">Log in</a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
