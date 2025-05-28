// src/pages/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import '../App.css';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('loading');  
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setStatus('ready');
        }
      }
    );
    return () => subscription?.unsubscribe?.();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('updating');
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      console.error('Reset error:', updateError.message);
      setError(updateError.message);
      setStatus('error');
    } else {
      setStatus('success');
    }
  };

  if (status === 'loading') {
    return <div className="container" style={{ padding: '2rem' }}>Loading reset form…</div>;
  }

  if (status === 'error') {
    return (
      <div className="container" style={{ padding: '2rem' }}>
        <h2>Sorry, something went wrong.</h2>
        <p>{error || 'Please try your reset link again.'}</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Password Updated!</h2>
        <button className="btn" onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>New Password</label>
          <input
            type="password"
            className="input-field"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
            autoComplete="new-password"
          />
        </div>
        <button className="btn" type="submit" disabled={status === 'updating'}>
          {status === 'updating' ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
