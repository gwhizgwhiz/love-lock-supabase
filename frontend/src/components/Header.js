// src/components/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import logo from '../assets/logo.png';
import '../App.css';  // your existing CSS for .header, .dropdown-menu, .btn, etc.

export default function Header() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef();

  // load user
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

  const initials = user?.email?.[0].toUpperCase() || '?';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <header className="header">
      <Link to="/">
        <img src={logo} alt="App Logo" className="logo" />
      </Link>

      {user && (
        <div className="header-right" ref={dropdownRef}>
          
          {/* View Profiles button */}
          <Link to="/profiles">
            <button className="btn" style={{ marginRight: '1rem' }}>
              View Profiles
            </button>
          </Link>

          {/* Avatar */}
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

          {/* Dropdown */}
          {open && (
            <div className="dropdown-menu">
              <Link
                to="/profile/edit"
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
