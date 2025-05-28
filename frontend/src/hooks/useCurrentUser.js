// src/hooks/useCurrentUser.js
import { useEffect, useState } from 'react'
import supabase from '../supabaseClient'
import defaultAvatar from '../assets/default-avatar.png'

// Turn either a full URL or a storage key into a public URL
function resolveAvatarUrl(raw) {
  if (!raw) return defaultAvatar
  if (raw.startsWith('http')) return raw

  // If your column is "avatars/xyz.jpg", strip the bucket folder
  const fileKey = raw.replace(/^avatars\//, '')

  const { data, error } = supabase
    .storage
    .from('avatars')
    .getPublicUrl(fileKey)

  if (error) {
    console.error('Error resolving avatar URL:', error)
    return defaultAvatar
  }
  return data.publicUrl || defaultAvatar
}

export default function useCurrentUser() {
  const [userId, setUserId] = useState(null)
  const [profile, setProfile] = useState(null)
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatar)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true)
      // 1) get the authenticated user
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()

      if (userError) {
        setError(userError.message)
        setLoading(false)
        return
      }
      if (!user) {
        setError('No authenticated user.')
        setLoading(false)
        return
      }

      setUserId(user.id)

      // 2) fetch that user's profile row
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          name,
          avatar_url,
          trust_score,
          is_verified,
          gender_identity,
          dating_preference,
          city,
          state,
          slug,
          zip
        `)
        .eq('user_id', user.id)
        .single()

      if (profileError) {
        setError(profileError.message)
        setProfile(null)
        setAvatarUrl(defaultAvatar)
      } else {
        setProfile(data)
        // 3) normalize the avatar_url to a real public URL
        setAvatarUrl(resolveAvatarUrl(data.avatar_url))
        setError(null)
      }

      setLoading(false)
    }

    fetchProfile()
  }, [])

  return { userId, profile, avatarUrl, loading, error }
}
