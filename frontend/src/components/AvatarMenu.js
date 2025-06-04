// src/components/AvatarMenu.js
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useCurrentUser from '../hooks/useCurrentUser';
import defaultAvatar from '../assets/default-avatar.png';
import '../App.css';

export default function AvatarMenu({ onSignOut }) {
  const { avatarUrl, slug, loading } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const profileLink = '/profile/edit';

  const menuItems = [
    { label: 'Edit Profile',   to: '/profile/edit' },
    { label: 'Settings',     to: '/settings' },
    { label: 'Preferences',  to: '/preferences' },
  ];

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (loading) return null; // Optionally, add a spinner here if needed

  return (
    <div className="avatar-menu inline-block" ref={menuRef}>
      <button
        className="avatar-menu-button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <img
          src={avatarUrl || defaultAvatar}
          alt="User avatar"
          className="avatar-menu-avatar"
        />
      </button>

      {open && (
        <div className="avatar-menu-dropdown" role="menu">
          {menuItems.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className="avatar-menu-item"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}

          <button
            className="avatar-menu-item"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
