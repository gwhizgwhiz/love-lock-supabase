import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth              from '../hooks/useAuth';

export default function PrivateLayout() {
  const { user, loading } = useAuth();
  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.email_confirmed_at) return <Navigate to="/verify-email" replace />;
  return <Outlet />;
}
