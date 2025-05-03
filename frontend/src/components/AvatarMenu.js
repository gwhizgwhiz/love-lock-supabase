import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import supabase from '../supabaseClient'

export default function AvatarMenu({ userEmail, profileSlug }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e) => !ref.current?.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = userEmail[0].toUpperCase()
  const profileLink = profileSlug
    ? `/profiles/${profileSlug}`
    : '/profile/edit'

  const logout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="relative" ref={ref}>
      <button
        className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center focus:outline-none"
        onClick={() => setOpen((o) => !o)}
        title={userEmail}
      >
        {initials}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-md overflow-hidden z-10">
          <Link to={profileLink} className="block px-4 py-2 hover:bg-gray-100 text-sm" onClick={() => setOpen(false)}>
            My Profile
          </Link>
          <Link to="/preferences" className="block px-4 py-2 hover:bg-gray-100 text-sm" onClick={() => setOpen(false)}>
            Preferences
          </Link>
          <Link to="/settings" className="block px-4 py-2 hover:bg-gray-100 text-sm" onClick={() => setOpen(false)}>
            Settings
          </Link>
          <button onClick={logout} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">
            Log Out
          </button>
        </div>
      )}
    </div>
  )
}
