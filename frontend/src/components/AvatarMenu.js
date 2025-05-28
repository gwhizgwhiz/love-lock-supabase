// src/components/AvatarMenu.jsx
import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import supabase from '../supabaseClient'
import defaultAvatar from '../assets/default-avatar.png'
import '../App.css'

function resolveAvatarUrl(raw) {
  if (!raw) return defaultAvatar
  if (raw.startsWith('http')) return raw
  const { data, error } = supabase.storage.from('avatars').getPublicUrl(raw)
  return error ? defaultAvatar : data.publicUrl || defaultAvatar
}

export default function AvatarMenu({ onSignOut }) {
  const [open, setOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatar)
  const [profileSlug, setProfileSlug] = useState(null)
  const menuRef = useRef(null)

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (!user || error) return

      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('avatar_url, slug')
        .eq('user_id', user.id)
        .single()

      if (profileErr) {
        console.error('Error fetching profile:', profileErr)
        return
      }

      setAvatarUrl(resolveAvatarUrl(profile.avatar_url))
      setProfileSlug(profile.slug || null)
    }

    loadProfile()
  }, [])

  useEffect(() => {
    const handler = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const profileLink = profileSlug ? `/profiles/${profileSlug}` : '/profile/edit'

  const menuItems = [
    { label: 'My Profile', to: profileLink },
    { label: 'Settings', to: '/settings' },
    { label: 'Preferences', to: '/preferences' },
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
          src={avatarUrl}
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
