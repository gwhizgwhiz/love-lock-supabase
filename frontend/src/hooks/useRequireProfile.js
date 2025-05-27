import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from './useAuth';
import supabase from '../supabaseClient';

export default function useRequireProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) return; // Already handled by RequireAuth

      const { data, error } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        // Redirect to profile creation if no profile found
        navigate('/profile/edit', { replace: true, state: { from: location.pathname } });
      }
    };

    checkProfile();
  }, [user, navigate, location]);
}
