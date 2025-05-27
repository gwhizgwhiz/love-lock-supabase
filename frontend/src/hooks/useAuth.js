// src/hooks/useAuth.js
import { useEffect, useState } from 'react';
import supabase from '../supabaseClient';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [slug, setSlug] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setSlug(null);
      setAvatarUrl(null);
      setUnreadCount(0);
      return;
    }

    (async () => {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, user_id, name, avatar_url, trust_score, is_verified, gender_identity, dating_preference, city, state, slug, zipcode')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile info:', profileError);
      } else if (profile) {
        setSlug(profile.name || null);
        if (profile.avatar_url) {
          const { data: urlData, error: urlError } = supabase
            .storage
            .from('avatars')
            .getPublicUrl(profile.avatar_url);
          if (urlError) {
            console.error('Error generating avatar public URL:', urlError);
            setAvatarUrl(null);
          } else {
            setAvatarUrl(urlData.publicUrl || null);
          }
        } else {
          setAvatarUrl(null);
        }
      }

      // For now: skip unread count until we wire up messaging
      setUnreadCount(0);
    })();
  }, [user]);

  return { user, slug, avatarUrl, unreadCount };
}
