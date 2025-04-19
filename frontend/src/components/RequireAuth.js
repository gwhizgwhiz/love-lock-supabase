import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const navigate           = useNavigate();
  const location           = useLocation();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login',  { replace: true, state: { from: location } });
      } else if (!user.email_confirmed_at) {
        navigate('/verify-email', { replace: true });
      }
    }
  }, [user, loading, navigate, location]);

  if (loading) return <p>Loading...</p>;
  if (user && user.email_confirmed_at) return children;
  return null;
}
