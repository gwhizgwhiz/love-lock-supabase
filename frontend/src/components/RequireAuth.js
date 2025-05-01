// src/components/RequireAuth.jsx
import React, { useState, useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import supabase from '../supabaseClient'

export default function RequireAuth() {
  const [session, setSession] = useState(undefined)
  const location = useLocation()

  useEffect(() => {
    // 1) On mount, load any persisted session (incl. magic-link / recovery)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // 2) Subscribe to future auth changes (login, logout, recovery)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession)
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  // 3) While we don’t yet know, show a spinner (or your loading UI)
  if (session === undefined) {
    return <div className="spinner" />
  }

  // 4) Not signed in → bounce to login (preserve intended destination)
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 5) Signed in but email unconfirmed → verify-email flow
  if (!session.user.email_confirmed_at) {
    return <Navigate to="/verify-email" replace />
  }

  // 6) Otherwise you’re good—render child routes
  return <Outlet />
}
