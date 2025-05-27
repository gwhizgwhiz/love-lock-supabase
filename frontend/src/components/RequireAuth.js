// src/components/RequireAuth.jsx
import React, { useState, useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import supabase from '../supabaseClient'

export default function RequireAuth() {
  const [session, setSession] = useState(undefined)
  const [hasProfile, setHasProfile] = useState(undefined)
  const location = useLocation()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, current) => setSession(current)
    )
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const checkProfile = async () => {
      if (!session?.user) return
      const { data, error } = await supabase
        .from('person_of_interest')
        .select('id')
        .eq('created_by', session.user.id) // 🔥 Corrected field
        .limit(1)

      if (error) {
        console.error('Error checking profile:', error)
        setHasProfile(false)
      } else {
        setHasProfile(!!data.length)
      }
    }

    if (session?.user?.email_confirmed_at) {
      checkProfile()
    }
  }, [session])

  if (session === undefined || (session?.user?.email_confirmed_at && hasProfile === undefined)) {
    return <div className="spinner">Loading...</div>
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!session.user.email_confirmed_at) {
    return <Navigate to="/verify-email" replace />
  }

  if (hasProfile === false) {
    return <Navigate to="/profile/edit" replace />
  }

  return <Outlet />
}
