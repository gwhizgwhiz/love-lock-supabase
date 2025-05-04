// src/components/Header.jsx
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import AvatarMenu from './AvatarMenu'
import logo from '../assets/logo.png'
import supabase from '../supabaseClient'
import '../App.css'

export default function Header() {
  const { user, slug, avatarUrl, unreadCount } = useAuth()
  const navigate = useNavigate()

  const logoutFunction = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <header className="header">
      <Link to="/" className="header-brand">
        <img src={logo} alt="LoveLock" className="logo" />
        <span className="site-name">LoveLock</span>
      </Link>

      <div className="header-right">
        {!user ? (
          <>
            <button className="btn btn-small" onClick={() => navigate('/login')}>
              Log In
            </button>
            <button className="btn btn-small" onClick={() => navigate('/signup')}>
              Sign Up
            </button>
          </>
        ) : (
          <>
            <button className="btn-inverse btn-small" onClick={() => navigate('/profiles')}>
              View Profiles
            </button>

            <div style={{ position: 'relative' }}>
              <button className="btn-outline btn-small" onClick={() => navigate('/inbox')}>
                Inbox
              </button>
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </div>

            <button className="btn-outline btn-small" onClick={() => navigate('/add-experience')}>
              Rate a Date
            </button>

            <AvatarMenu
              avatarUrl={avatarUrl}
              profileSlug={slug}
              onSignOut={logoutFunction}
            />
          </>
        )}
      </div>
    </header>
  )
}
