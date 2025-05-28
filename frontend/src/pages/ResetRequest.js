// src/pages/ResetRequest.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import '../App.css';

export default function ResetRequest() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setError(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      console.error('Reset request error:', resetError.message);
      setError(resetError.message || 'Could not send reset email. Please try again.');
      setStatus('error');
    } else {
      setStatus('sent');
    }
  };

  if (status === 'sent') {
    return (
      <div className="container" style={{ textAlign: 'center' }}>
        <h2>Check Your Inbox</h2>
        <p>We’ve emailed you a link to reset your password.</p>
        <button className="btn" onClick={() => navigate('/login')}>
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Email Address</label>
          <input
            type="email"
            className="input-field"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button className="btn" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send Reset Link'}
        </button>
      </form>
      {status === 'error' && (
        <p className="error" style={{ marginTop: '1rem' }}>{error}</p>
      )}
    </div>
  );
}
