// frontend/src/HomePage.js
import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from './supabaseClient';
import logo from './assets/logo.png';
import './App';

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });
  }, []);

  // close dropdown on outside click
  useEffect(() => {
    function onClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const initials = user?.email ? user.email.charAt(0).toUpperCase() : '?';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="home-container">
      <header className="header">
        <Link to="/">
          <img src={logo} alt="App Logo" className="logo" />
        </Link>
        {user && (
          <div className="header-right" ref={dropdownRef}>
            <div
              className="avatar"
              onClick={() => setOpen(o => !o)}
              title={user.email}
            >
              {initials}
            </div>
            {open && (
              <div className="dropdown-menu">
                <Link to="/profile/edit">
                  <button className="btn-small">My Profile</button>
                </Link>
                <Link to="/settings" className="dropdown-item" onClick={() => setOpen(false)}>
                  Settings
                </Link>
                <Link to="/preferences" className="dropdown-item" onClick={() => setOpen(false)}>
                  Preferences
                </Link>
                <button className="dropdown-item logout-item" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <section className="banner">
        <h1>Your Heart, Your Lock, Your Trust</h1>
        <p>
          Welcome to Love Lock—share your experiences, build trust, and connect
          with confidence. Log an experience, explore profiles, and see how
          trust grows with every interaction.
        </p>
        <div className="home-buttons">
          <Link to="/add-experience">
            <button className="btn">Rate a Date</button>
          </Link>
          <Link to="/profiles">
            <button className="btn">Browse Profiles</button>
          </Link>
        </div>
      </section>
    </div>
  );
}
