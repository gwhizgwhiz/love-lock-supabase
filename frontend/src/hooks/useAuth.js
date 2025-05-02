// src/hooks/useAuth.js
import { useState, useEffect } from 'react'
import supabase               from '../supabaseClient'

export default function useAuth() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    // 1) Load any existing session (incl. magic-link or reset)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // 2) Subscribe to future auth changes (sign in, sign out, recovery)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession)
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  // loading = true until we know if there’s a session or not
  const loading = session === undefined
  const user    = session?.user ?? null

  return { user, loading }
}
