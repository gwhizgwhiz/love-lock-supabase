// src/components/AvatarMenu.jsx
import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import supabase from '../supabaseClient'
import defaultAvatar from '../assets/default-avatar.png'
import '../App.css'

export default function AvatarMenu({ onSignOut }) {
  const [open, setOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatar)
  const [profileSlug, setProfileSlug] = useState(null)
  const menuRef = useRef(null)

  // Load avatar + slug from POI record
  useEffect(() => {
    const loadProfileInfo = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (!user || error) return

      const { data, error: profileErr } = await supabase
        .from('person_of_interest')
        .select('photo_reference_url, slug')
        .eq('created_by', user.id)
        .limit(1)

      if (profileErr) return

      const profile = data?.[0]
      if (!profile) return

      // Load avatar if available
      if (profile.photo_reference_url) {
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(profile.photo_reference_url)
        if (urlData?.publicUrl) {
          setAvatarUrl(urlData.publicUrl)
        }
      }

      // Save slug for profile link
      if (profile.slug) {
        setProfileSlug(profile.slug)
      }
    }

    loadProfileInfo()
  }, [])

  const profileLink = profileSlug ? `/profiles/${profileSlug}` : '/profile/edit'

  const menuItems = [
    { label: 'My Profile',   to: profileLink },
    { label: 'Settings',     to: '/settings' },
    { label: 'Preferences',  to: '/preferences' },
  ]

  useEffect(() => {
    const handler = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

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
