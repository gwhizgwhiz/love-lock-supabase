// src/hooks/useCurrentUser.js
import { useEffect, useState, useCallback } from 'react';
import supabase from '../supabaseClient';
import resolveAvatarUrl from '../lib/resolveAvatarUrl';
import defaultAvatar from '../assets/default-avatar.png';

export default function useCurrentUser() {
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [slug, setSlug] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatar);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setError(userError?.message || 'No authenticated user');
      setUserId(null);
      setProfile(null);
      setSlug(null);
      setAvatarUrl(defaultAvatar);
      setLoading(false);
      return;
    }

    setUserId(user.id);

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError || !profileData) {
      console.warn('Profile not found:', profileError?.message || 'No profile data');
      setProfile(null);
      setSlug(null);
      setAvatarUrl(defaultAvatar);
    } else {
      setProfile(profileData);
      setSlug(profileData.slug || null);
      setAvatarUrl(await resolveAvatarUrl(profileData.avatar_url));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;

    if (mounted) fetchProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUserId(null);
        setProfile(null);
        setSlug(null);
        setAvatarUrl(defaultAvatar);
      } else {
        fetchProfile();
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  return {
    userId,
    profile,
    slug,
    avatarUrl,
    loading,
    error,
    refetch: fetchProfile
  };
}
