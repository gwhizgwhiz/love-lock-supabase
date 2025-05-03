// src/App.js

import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Layout               from './components/Layout'
import RequireAuth          from './components/RequireAuth'
import RequireAdmin         from './components/RequireAdmin'
import RatingCriteriaAdmin  from './components/RatingCriteriaAdmin'

import HomePage             from './HomePage'
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

import AddExperience        from './components/AddExperience'
import Settings             from './pages/Settings'
import Preferences          from './pages/Preferences'

export default function App() {
  useEffect(() => {
    console.log('🛠️  src/App.js has mounted')
  }, [])

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Public */}
          <Route path="/"               element={<HomePage />} />
          <Route path="/login"          element={<LogIn />} />
          <Route path="/signup"         element={<SignUp />} />
          <Route path="/verify-email"   element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ResetRequest />} />
          <Route path="/reset-password"  element={<ResetPassword />} />

          {/* Protected */}
          <Route element={<RequireAuth />}>
            <Route path="/create-profile"  element={<ProfileCreate />} />
            <Route path="/profiles"        element={<ProfilesPage />} />
            <Route path="/profiles/:slug"  element={<ProfileDetail />} />
            <Route path="/profile/edit"    element={<ProfileEdit />} />

            <Route path="/inbox"           element={<Inbox />} />
            <Route path="/compose"         element={<Compose />} />
            <Route path="/threads"         element={<Navigate to="/inbox" replace />} />
            <Route path="/threads/:threadId" element={<Thread />} />

            <Route path="/add-experience"  element={<AddExperience />} />
            <Route path="/settings"        element={<Settings />} />
            <Route path="/preferences"     element={<Preferences />} />

            <Route element={<RequireAdmin />}>
              <Route path="/admin/criteria" element={<RatingCriteriaAdmin />} />
            </Route>
          </Route>

          {/* Catch‑all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
