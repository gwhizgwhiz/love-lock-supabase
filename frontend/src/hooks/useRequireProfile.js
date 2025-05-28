// src/hooks/useRequireProfile.js
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useCurrentUser from './useCurrentUser';
import supabase from '../supabaseClient';

export default function useRequireProfile() {
  const { userId, loading } = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading || !userId) return; // Wait for user to load

    const checkProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        // Redirect to profile creation if no profile found
        navigate('/profile/edit', { replace: true, state: { from: location.pathname } });
      }
    };

    checkProfile();
  }, [userId, loading, navigate, location]);
}
