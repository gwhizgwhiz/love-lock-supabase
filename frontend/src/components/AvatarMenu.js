// src/components/AvatarMenu.jsx
import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import defaultAvatar from '../assets/default-avatar.png'
import '../App.css'

export default function AvatarMenu({ avatarUrl, profileSlug, onSignOut }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  // Close when clicking outside
  useEffect(() => {
    const handler = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Build your profile URL from the slug
  const profileLink = profileSlug
    ? `/profiles/${profileSlug}`
    : '/profile/edit'

  // Menu entries
  const menuItems = [
    { label: 'My Profile',   to: profileLink },
    { label: 'Settings',     to: '/settings' },
    { label: 'Preferences',  to: '/preferences' },
  ]

  return (
    <div className="avatar-menu inline-block" ref={menuRef}>
      <button
        className="avatar-menu-button"
        onClick={() => setOpen(o => !o)}
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
              setOpen(false)
              onSignOut()
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
