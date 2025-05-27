// src/hooks/useCurrentUser.js

import { useState, useEffect } from 'react'
import supabase from '../supabaseClient'

export default function useCurrentUser() {
  const [user, setUser] = useState(null)
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()
        if (error) throw error

        if (isMounted) {
          setUser(data?.user || null)
          setUserId(data?.user?.id || null)
          setLoading(false)
        }
      } catch (err) {
        console.error('❌ useCurrentUser error:', err)
        if (isMounted) {
          setError(err.message)
          setLoading(false)
        }
      }
    }

    fetchUser()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user || null
      if (isMounted) {
        setUser(user)
        setUserId(user?.id || null)
      }
    })

    return () => {
      isMounted = false
      listener?.subscription?.unsubscribe()
    }
  }, [])

  return { user, userId, loading, error }
}
