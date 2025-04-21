// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage    from './HomePage';
import SignUp      from './pages/SignUp';
import LogIn       from './pages/LogIn';
import VerifyEmail from './pages/VerifyEmail';

import SignUp        from './pages/SignUp';
import LogIn         from './pages/LogIn';
import VerifyEmail   from './pages/VerifyEmail';

import ProfilesPage  from './pages/ProfilesPage';
import ProfileDetail from './pages/ProfileDetail';
import ThreadsPage   from './pages/Thread';
import Thread        from './pages/Thread';    // ← now correctly in pages/
import Inbox         from './pages/Inbox';
import RequireAuth   from './components/RequireAuth';
import RequireAdmin from './components/RequireAdmin';
import RatingCriteriaAdmin from './components/RatingCriteriaAdmin';
import AddExperience from './components/AddExperience';


export default function App() {
  return (
    <BrowserRouter>
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
          path="/threads"
          element={
            <RequireAuth>
              <ThreadsPage />
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
        <Route
          path="/admin/criteria"
          element={
            <RequireAdmin>
              <RatingCriteriaAdmin />
            </RequireAdmin>
          }
        />
        {/* Landing / Home */}
        <Route path="/" element={<HomePage />} />
        {/* Fallback: redirect all others to login */}
        <Route path="*" element={<LogIn />} />
        <Route path="/add-experience" element={<AddExperience />} />
      </Routes>
    </BrowserRouter>
  );
}
