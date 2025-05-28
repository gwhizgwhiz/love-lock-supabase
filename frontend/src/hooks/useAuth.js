// src/hooks/useAuth.js
import { useEffect, useState } from 'react';
import supabase from '../supabaseClient';
import defaultAvatar from '../assets/default-avatar.png';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatar);
  const [slug, setSlug] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Initial user load
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user === null) return; // Still loading
    if (!user) {
      // Logged out
      setProfile(null);
      setSlug(null);
      setAvatarUrl(defaultAvatar);
      setLoading(false);
      return;
    }

    // Fetch profile for logged-in user
    (async () => {
      setLoading(true);
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('id, slug, avatar_url')
        .eq('user_id', user.id)
        .single();

      if (error || !profileData) {
        console.warn('Profile not found for user:', error?.message || 'No profile data');
        setProfile(null);
        setSlug(null);
        setAvatarUrl(defaultAvatar);
      } else {
        setProfile(profileData);
        setSlug(profileData.slug || null);

        // Avatar logic
        if (!profileData.avatar_url) {
          setAvatarUrl(defaultAvatar);
        } else if (profileData.avatar_url.startsWith('http')) {
          setAvatarUrl(profileData.avatar_url);
        } else {
          const { data: { publicUrl }, error: avatarError } = supabase
            .storage
            .from('avatars')
            .getPublicUrl(profileData.avatar_url);

          if (avatarError) {
            console.error('Avatar fetch error:', avatarError.message);
            setAvatarUrl(defaultAvatar);
          } else {
            setAvatarUrl(publicUrl || defaultAvatar);
          }
        }
      }

      setLoading(false);
    })();
  }, [user]);

  return { user, profile, slug, avatarUrl, loading };
}
