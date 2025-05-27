import React, { createContext, useContext, useEffect, useState } from 'react';
import supabase from '../supabaseClient';

// Create the context
const ProfileContext = createContext();

// Provider component
export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          setProfile(null);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('id, user_id, name, avatar_url, trust_score, is_verified, gender_identity, dating_preference, city, state, zip')
          .eq('user_id', user.id) // assuming you have `user` context in scope
          .single();

        if (error && error.code !== 'PGRST116') {
          setError(error.message);
          setProfile(null);
        } else {
          setProfile(data || null);
        }
      } catch (err) {
        setError(err.message);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();

    // Refresh profile if auth state changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, _session) => {
      loadProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, setProfile, loading, error }}>
      {children}
    </ProfileContext.Provider>
  );
}

// Hook to use profile
export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
