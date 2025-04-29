// src/components/RequireAuth.jsx
import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p>Loading…</p>;
  }

  // Not signed in → send to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Signed in but email not confirmed → verify email flow
  if (!user.email_confirmed_at) {
    return <Navigate to="/verify-email" replace />;
  }

  // All good → render the child routes here
  return <Outlet />;
}
