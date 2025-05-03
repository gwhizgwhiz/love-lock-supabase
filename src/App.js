// src/App.js
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Layout               from './components/Layout'
import RequireAuth          from './components/RequireAuth'

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

import RequireAdmin         from './components/RequireAdmin'
import RatingCriteriaAdmin  from './components/RatingCriteriaAdmin'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/** — Public routes — **/}
          <Route path="/"           element={<HomePage />} />
          <Route path="/login"      element={<LogIn />} />
          <Route path="/signup"     element={<SignUp />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ResetRequest />} />
          <Route path="/reset-password"  element={<ResetPassword />} />

          {/** — All routes below require a logged-in user — **/}
          <Route element={<RequireAuth />}>
            {/* Profile setup & browsing */}
            <Route path="/create-profile"  element={<ProfileCreate />} />
            <Route path="/profiles"        element={<ProfilesPage />} />
            <Route path="/profiles/:slug"  element={<ProfileDetail />} />
            <Route path="/profile/edit"    element={<ProfileEdit />} />

            {/* Messaging */}
            <Route path="/inbox"           element={<Inbox />} />
            <Route path="/compose"         element={<Compose />} />
            <Route path="/threads"         element={<Navigate to="/inbox" replace />} />
            <Route path="/threads/:threadId" element={<Thread />} />

            {/* Other protected features */}
            <Route path="/add-experience"  element={<AddExperience />} />
            <Route path="/settings"        element={<Settings />} />
            <Route path="/preferences"     element={<Preferences />} />

            {/** — Admin sub‑routes — **/}
            <Route element={<RequireAdmin />}>
              <Route path="/admin/criteria" element={<RatingCriteriaAdmin />} />
            </Route>
          </Route>

          {/** — Catch‑all: send anything unknown to home — **/}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
