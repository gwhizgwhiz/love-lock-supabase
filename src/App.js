// src/App.js
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Layout               from './components/Layout'
import RequireAuth          from './components/RequireAuth'
import RequireAdmin         from './components/RequireAdmin'

import HomePage             from './pages/HomePage'
import LogIn                from './pages/LogIn'
import SignUp               from './pages/SignUp'
import VerifyEmail          from './pages/VerifyEmail'

import ResetRequest         from './pages/ResetRequest'
import ResetPassword        from './pages/ResetPassword'

import ProfileCreate        from './pages/ProfileCreate'
import ProfilesPage         from './pages/ProfilesPage'
import ProfileDetail        from './pages/ProfileDetail'
import ProfileEdit          from './pages/ProfileEdit'

import Compose              from './pages/Compose'
import Inbox                from './pages/Inbox'
import Thread               from './pages/Thread'
import AddExperience        from './pages/AddExperience'

import Settings             from './pages/Settings'
import Preferences          from './pages/Preferences'

import RatingCriteriaAdmin  from './components/RatingCriteriaAdmin'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>

          {/* Public routes */}
          <Route path="/"                element={<HomePage />} />
          <Route path="/login"           element={<LogIn />} />
          <Route path="/signup"          element={<SignUp />} />
          <Route path="/verify-email"    element={<VerifyEmail />} />

          {/* Password‐reset (also public) */}
          <Route path="/forgot-password" element={<ResetRequest />} />
          <Route path="/reset-password"  element={<ResetPassword />} />

          {/* All the routes below require a logged-in user */}
          <Route element={<RequireAuth />}>

            {/* Profile setup */}
            <Route path="/create-profile" element={<ProfileCreate />} />

            {/* Profile browsing/editing */}
            <Route path="/profiles"       element={<ProfilesPage />} />
            <Route path="/profiles/:slug" element={<ProfileDetail />} />
            <Route path="/profile/edit"   element={<ProfileEdit />} />

            {/* Messaging */}
            <Route path="/compose"            element={<Compose />} />
            <Route path="/inbox"              element={<Inbox />} />
            <Route path="/threads"            element={<Navigate to="/inbox" replace />} />
            <Route path="/threads/:threadId"  element={<Thread />} />

            {/* Other protected features */}
            <Route path="/add-experience" element={<AddExperience />} />

            {/* User settings */}
            <Route path="/settings"    element={<Settings />} />
            <Route path="/preferences" element={<Preferences />} />

            {/* Admin-only */}
            <Route element={<RequireAdmin />}>
              <Route path="/admin/criteria" element={<RatingCriteriaAdmin />} />
            </Route>
          </Route>

          {/* Catch-all: redirect unknown URLs to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
