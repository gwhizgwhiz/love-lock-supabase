// src/hooks/useCurrentUser.js
import { useEffect, useState } from 'react';
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

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        setError(userError.message);
        setLoading(false);
        return;
      }

      if (!user) {
        setError('No authenticated user.');
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
        .select('id, user_id, name, slug, avatar_url, gender_identity, dating_preference, city, state, zipcode')
        .eq('user_id', user.id)
        .single();

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

      setError(null);
      setLoading(false);
    }

    fetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUserId(null);
        setProfile(null);
        setSlug(null);
        setAvatarUrl(defaultAvatar);
      } else {
        fetchProfile();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { userId, profile, slug, avatarUrl, loading, error };
}
