// src/pages/ProfileCreate.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate }                from 'react-router-dom';
import supabase                       from '../supabaseClient';
import '../App.css';

export default function ProfileCreate() {
  const [slug, setSlug]   = useState('');
  const [user, setUser]   = useState(null);
  const [error, setError] = useState(null);
  const navigate          = useNavigate();

  // 1) Ensure we have an authenticated user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        navigate('/login');
      } else {
        setUser(data.user);
      }
    });
  }, [navigate]);

  // 2) When they submit, insert into profiles and write into user_metadata
  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);

    try {
      // Insert into your profiles table
      const { data: profile, error: insErr } = await supabase
        .from('profiles')
        .insert({ user_id: user.id, slug })
        .single();
      if (insErr) throw insErr;

      // Write slug into their auth metadata
      const { error: metaErr } = await supabase.auth.updateUser({
        data: { slug: profile.slug }
      });
      if (metaErr) console.error('user_metadata update failed', metaErr);

      // 3) Go to their new public profile
      navigate(`/profiles/${profile.slug}`);
    } catch (err) {
      setError(err.message);
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
          <button type="submit" className="btn">
            Create Profile
          </button>
        </form>
      </div>
    </div>
  );
}
