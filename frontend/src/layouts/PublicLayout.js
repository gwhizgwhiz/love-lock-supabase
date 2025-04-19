import React from 'react';
import { Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div className="login-container">
      <Outlet />
    </div>
  );
}
