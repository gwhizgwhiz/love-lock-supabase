// src/hooks/useAuth.js
import { useEffect, useState } from 'react'
import supabase from '../supabaseClient'

export default function useAuth() {
  const [user, setUser] = useState(null)
  const [slug, setSlug] = useState(null)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)

  // Listen for auth state changes
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    )
    return () => listener.subscription.unsubscribe()
  }, [])

  // When `user` changes, fetch slug, avatar, and unread count
  useEffect(() => {
    if (!user) {
      setSlug(null)
      setAvatarUrl(null)
      setUnreadCount(0)
      return
    }

    ;(async () => {
      // 1) Fetch slug + photo_reference_url from the RLS‑protected view
      try {
        const { data, error } = await supabase
          .from('current_user_profile_view')
          .select('slug, photo_reference_url')

        if (error) {
          console.error('Supabase error fetching profile info:', error)
          return
        }
        if (data) {
          setSlug(data.slug)

          // 2) Turn the storage path into a public URL
          const { data: urlData, error: urlError } = supabase
            .storage
            .from('avatars')                  // your bucket
            .getPublicUrl(data.photo_reference_url)

          if (urlError) {
            console.error('Error generating avatar public URL:', urlError)
            setAvatarUrl(null)
          } else {
            setAvatarUrl(urlData.publicUrl)
          }
        }
      } catch (networkError) {
        console.error('Network error fetching profile info:', networkError)
      }

      // 3) Fetch total unread count from your existing view
      try {
        const { data } = await supabase
          .from('inbox_with_profile_view')
          .select('unread_count')

        const total = (data || []).reduce(
          (sum, row) => sum + (row.unread_count || 0),
          0
        )
        setUnreadCount(total)
      } catch (err) {
        console.error('Error fetching unread count:', err)
      }
    })()
  }, [user])

  return { user, slug, avatarUrl, unreadCount }
}
