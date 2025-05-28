// src/pages/Settings.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import useCurrentUser from '../hooks/useCurrentUser';
import '../App.css';

export default function Settings() {
  const navigate = useNavigate();
  const { userId, loading: userLoading } = useCurrentUser();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadEmail = async () => {
      if (!userId) return;

      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        navigate('/login');
      } else {
        setEmail(user.email);
      }
    };

    loadEmail();
  }, [userId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const updates = { email };
    if (newPassword) updates.password = newPassword;

    const { error: updateErr } = await supabase.auth.updateUser(updates);
    if (updateErr) setError(updateErr.message || 'An error occurred.');
    else setError(null);

    setSaving(false);
  };

  if (userLoading) return <div className="spinner">Loading…</div>;
  if (!userId) return <div className="spinner">Redirecting…</div>;

  return (
    <div className="container settings-container">
      <h2>Account Settings</h2>
      {error && <p className="error">{error}</p>}
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          New Password
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Leave blank to keep current"
          />
        </label>
        <button type="submit" className="btn" disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
      <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
        Want to update your profile info or avatar?&nbsp;
        <a href="/profile/edit">Go to Profile Editor →</a>
      </p>
    </div>
  );
}
