// src/pages/ProfileCreate.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import useCurrentUser from '../hooks/useCurrentUser';
import '../App.css';

export default function ProfileCreate() {
  const { userId, loading: userLoading } = useCurrentUser();
  const [slug, setSlug] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (userLoading || !userId) {
      setError('You must be logged in to create a profile.');
      setSubmitting(false);
      return;
    }

    try {
      // Insert profile into profiles table
      const { data: profile, error: insErr } = await supabase
        .from('profiles')
        .insert({
          main_alias: slug,
          slug,
          user_id: userId,
          is_user_profile: true,
        })
        .single();
      if (insErr) throw insErr;

      // Optional: Update auth metadata (optional, consider removing)
      const { error: metaErr } = await supabase.auth.updateUser({
        data: { slug: profile.slug },
      });
      if (metaErr) console.warn('user_metadata update failed', metaErr);

      navigate(`/profiles/${profile.slug}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container signup-page">
      <div className="login-form">
        <h1>Create Your Profile</h1>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username (slug):</label>
            <input
              type="text"
              className="input-field"
              value={slug}
              onChange={e => setSlug(e.target.value.toLowerCase())}
              required
            />
          </div>
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
