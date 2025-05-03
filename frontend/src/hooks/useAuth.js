import { useEffect, useState } from 'react'
import supabase from '../supabaseClient'

export default function useAuth() {
  const [user, setUser] = useState(null)
  const [slug, setSlug] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Initial and on‑change auth
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: sub } = supabase.auth.onAuthStateChange(
      (_evt, session) => setUser(session?.user ?? null)
    )
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) {
      setSlug(null)
      setUnreadCount(0)
      return
    }

    // Fetch profile slug
    supabase
      .from('person_of_interest')
      .select('slug')
      .eq('created_by', user.id)
      .single()
      .then(({ data }) => data?.slug && setSlug(data.slug))

    // Fetch total unread count
    supabase
      .from('inbox_with_profile_view')
      .select('unread_count')
      .then(({ data }) => {
        const total = (data || []).reduce((sum, r) => sum + (r.unread_count || 0), 0)
        setUnreadCount(total)
      })
  }, [user])

  return { user, slug, unreadCount }
}
