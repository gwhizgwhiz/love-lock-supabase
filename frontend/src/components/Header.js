// src/components/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate }               from 'react-router-dom';
import supabase                             from '../supabaseClient';
import logo                                 from '../assets/logo.png';
import '../App.css';  // your .header, .btn, .avatar, .dropdown-menu, etc.

export default function Header() {
  const [user, setUser]     = useState(null);
  const [slug, setSlug]     = useState(null);
  const [open, setOpen]     = useState(false);
  const navigate            = useNavigate();
  const dropdownRef         = useRef();

  useEffect(() => {
    // 1) Get initial session user
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // 2) Listen for login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user || null)
    );
    return () => subscription.unsubscribe();
  }, []);

  // Whenever user changes, grab their slug if they’re signed in
  useEffect(() => {
    if (!user) {
      setSlug(null);
      return;
    }
    supabase
      .from('person_of_interest')
      .select('slug')
      .eq('created_by', user.id)
      .single()
      .then(({ data, error }) => {
        if (data?.slug) setSlug(data.slug);
      });
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    function onClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const initials    = user?.email?.[0].toUpperCase() || '?';
  const profileLink = slug ? `/profiles/${slug}` : '/profile/edit';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <header className="header">
      <Link to="/">
        <img src={logo} alt="App Logo" className="logo" />
      </Link>

      {/* If no user → show Log In / Sign Up */}
      {!user && (
        <div className="header-right">
          <Link to="/login">
            <button className="btn">Log In</button>
          </Link>
          <Link to="/signup">
            <button className="btn" style={{ marginLeft: '1rem' }}>
              Sign Up
            </button>
          </Link>
        </div>
      )}

      {/* If user → show View Profiles + avatar/dropdown */}
      {user && (
        <div className="header-right" ref={dropdownRef}>
          <Link to="/profiles">
            <button className="btn" style={{ marginRight: '1rem' }}>
              View Profiles
            </button>
          </Link>

          <div
            className="avatar"
            onClick={() => setOpen(o => !o)}
            title={user.email}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#C42F33',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            {initials}
          </div>

          {open && (
            <div className="dropdown-menu">
              <Link
                to={profileLink}
                className="dropdown-item"
                onClick={() => setOpen(false)}
              >
                My Profile
              </Link>
              <Link
                to="/settings"
                className="dropdown-item"
                onClick={() => setOpen(false)}
              >
                Settings
              </Link>
              <Link
                to="/preferences"
                className="dropdown-item"
                onClick={() => setOpen(false)}
              >
                Preferences
              </Link>
              <button
                className="logout-item"
                onClick={handleLogout}
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
