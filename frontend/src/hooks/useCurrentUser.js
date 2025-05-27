import { useEffect, useState } from 'react';
import  supabase  from '../supabaseClient';

export default function useCurrentUser() {
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        setError(userError.message);
        setLoading(false);
        return;
      }

      if (!user) {
        setError('No authenticated user.');
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('id, user_id, name, avatar_url, trust_score, is_verified, gender_identity, dating_preference, city, state, slug, zip')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        setError(profileError.message);
        setProfile(null);
      } else {
        setProfile(data);
        setError(null);
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  return { userId, profile, loading, error };
}
