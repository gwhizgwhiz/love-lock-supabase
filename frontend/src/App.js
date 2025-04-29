// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Layout               from './components/Layout';
import HomePage             from './HomePage';
import SignUp               from './pages/SignUp';
import LogIn                from './pages/LogIn';
import VerifyEmail          from './pages/VerifyEmail';
import ProfileCreate        from './pages/ProfileCreate';
import ProfileEdit          from './pages/ProfileEdit';
import ProfilesPage         from './pages/ProfilesPage';
import ProfileDetail        from './pages/ProfileDetail';
import Thread               from './pages/Thread';
import Inbox                from './pages/Inbox';
import AddExperience        from './components/AddExperience';
import Settings             from './pages/Settings';
import Preferences          from './pages/Preferences';

import RequireAuth          from './components/RequireAuth';
import RequireAdmin         from './components/RequireAdmin';
import RatingCriteriaAdmin  from './components/RatingCriteriaAdmin';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Public */}
          <Route path="/signup"       element={<SignUp />} />
          <Route path="/login"        element={<LogIn />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* All of these require a logged-in user (and, as we’ll see, a slug) */}
          <Route element={<RequireAuth />}>
            {/* Profile setup */}
            <Route path="/create-profile" element={<ProfileCreate />} />

            {/* Profile browsing/editing */}
            <Route path="/profiles"       element={<ProfilesPage />} />
            <Route path="/profiles/:slug" element={<ProfileDetail />} />
            <Route path="/profile/edit"   element={<ProfileEdit />} />

            {/* Core features */}
            <Route path="/threads"        element={<Thread />} />
            <Route path="/threads/:threadId" element={<Thread />} />
            <Route path="/inbox"          element={<Inbox />} />
            <Route path="/add-experience" element={<AddExperience />} />

            {/* User settings */}
            <Route path="/settings"       element={<Settings />} />
            <Route path="/preferences"    element={<Preferences />} />

            {/* Admin */}
            <Route element={<RequireAdmin />}>
              <Route path="/admin/criteria" element={<RatingCriteriaAdmin />} />
            </Route>
          </Route>

          {/* Public home */}
          <Route path="/" element={<HomePage />} />

          {/* Catch-all: go home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
