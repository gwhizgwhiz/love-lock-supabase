// src/components/RequireAuth.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useCurrentUser from '../hooks/useCurrentUser';
import supabase from '../supabaseClient';

export default function RequireAuth() {
  const { userId, profile, loading: userLoading, error } = useCurrentUser();
  const [emailConfirmed, setEmailConfirmed] = useState(undefined);
  const [hasProfile, setHasProfile] = useState(undefined);
  const location = useLocation();

  useEffect(() => {
    const checkStatus = async () => {
      if (userLoading || !userId) return;

      // Check email confirmation
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setEmailConfirmed(false);
        return;
      }

      setEmailConfirmed(!!user.email_confirmed_at);

      // Check profile existence
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (profileError) {
        console.error('Error checking profile:', profileError);
        setHasProfile(false);
      } else {
        setHasProfile(!!data.length);
      }
    };

    checkStatus();
  }, [userId, userLoading]);

  if (userLoading || emailConfirmed === undefined || hasProfile === undefined) {
    return <div className="spinner">Loading...</div>;
  }

  if (!userId) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!emailConfirmed) {
    return <Navigate to="/verify-email" replace />;
  }

  if (!hasProfile) {
    return <Navigate to="/profile/edit" replace />;
  }

  return <Outlet />;
}
