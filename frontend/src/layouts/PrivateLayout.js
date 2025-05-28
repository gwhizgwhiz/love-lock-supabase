// src/layouts/PrivateLayout.js
import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useCurrentUser from '../hooks/useCurrentUser';
import supabase from '../supabaseClient';

export default function PrivateLayout() {
  const { userId, loading: userLoading } = useCurrentUser();
  const [emailConfirmed, setEmailConfirmed] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkEmailConfirmed = async () => {
      if (!userId) {
        setEmailConfirmed(false);
        setLoading(false);
        return;
      }

      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        setEmailConfirmed(false);
      } else {
        setEmailConfirmed(!!user.email_confirmed_at);
      }
      setLoading(false);
    };

    checkEmailConfirmed();
  }, [userId]);

  if (userLoading || loading) return <p>Loading...</p>;
  if (!userId) return <Navigate to="/login" replace />;
  if (!emailConfirmed) return <Navigate to="/verify-email" replace />;

  return <Outlet />;
}
