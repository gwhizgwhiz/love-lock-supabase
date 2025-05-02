// src/components/RequireAuth.jsx
import React, { useState, useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import supabase from '../supabaseClient'

export default function RequireAuth() {
  const [session, setSession] = useState(undefined)
  const location = useLocation()

  useEffect(() => {
    // 1) Load any existing session (from localStorage / URL fragment)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // 2) Subscribe to future auth changes (login, logout, recovery)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, current) => setSession(current)
    )
    return () => subscription.unsubscribe()
  }, [])

  // 3) While we’re checking, show a spinner
  if (session === undefined) {
    return <div className="spinner" />
  }

  // 4) If not logged in, redirect to /login
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 5) If email isn’t confirmed yet, send to /verify-email
  if (!session.user.email_confirmed_at) {
    return <Navigate to="/verify-email" replace />
  }

  // 6) Otherwise render the protected routes
  return <Outlet />
}
