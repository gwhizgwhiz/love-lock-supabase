// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Layout               from './components/Layout';
import HomePage             from './HomePage';
import SignUp               from './pages/SignUp';
import LogIn                from './pages/LogIn';
import VerifyEmail          from './pages/VerifyEmail';
import ProfileEdit          from './pages/ProfileEdit';
import ProfilesPage         from './pages/ProfilesPage';
import ProfileDetail        from './pages/ProfileDetail';
import Thread               from './pages/Thread';
import Inbox                from './pages/Inbox';
import RequireAuth          from './components/RequireAuth';
import RequireAdmin         from './components/RequireAdmin';
import RatingCriteriaAdmin  from './components/RatingCriteriaAdmin';
import AddExperience        from './components/AddExperience';
import Settings             from './pages/Settings';
import Preferences          from './pages/Preferences';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Public */}
          <Route path="/signup"       element={<SignUp />} />
          <Route path="/login"        element={<LogIn />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Protected: requires login & verification */}
          <Route
            path="/profiles"
            element={
              <RequireAuth>
                <ProfilesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/profiles/:slug"
            element={
              <RequireAuth>
                <ProfileDetail />
              </RequireAuth>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <RequireAuth>
                <ProfileEdit />
              </RequireAuth>
            }
          />
          <Route
            path="/threads"
            element={
              <RequireAuth>
                <Thread />
              </RequireAuth>
            }
          />
          <Route
            path="/threads/:threadId"
            element={
              <RequireAuth>
                <Thread />
              </RequireAuth>
            }
          />
          <Route
            path="/inbox"
            element={
              <RequireAuth>
                <Inbox />
              </RequireAuth>
            }
          />

          {/* Admin-only */}
          <Route
            path="/admin/criteria"
            element={
              <RequireAdmin>
                <RatingCriteriaAdmin />
              </RequireAdmin>
            }
          />

          {/* User settings */}
          <Route
            path="/settings"
            element={
              <RequireAuth>
                <Settings />
              </RequireAuth>
            }
          />
          <Route
            path="/preferences"
            element={
              <RequireAuth>
                <Preferences />
              </RequireAuth>
            }
          />
          
          {/* Misc */}
          <Route path="/add-experience" element={<AddExperience />} />

          {/* Landing / Home */}
          <Route path="/" element={<HomePage />} />

          {/* Fallback: send everyone else to login */}
          <Route path="*" element={<LogIn />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
