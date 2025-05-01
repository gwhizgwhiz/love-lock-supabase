// src/pages/ResetPassword.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../supabaseClient'

export default function ResetPassword() {
  // password entry + UI status
  const [password, setPassword] = useState('')
  const [status, setStatus]   = useState('loading')  
  // 'loading' → waiting for recovery event
  // 'ready'   → show the form
  // 'updating'→ submitting new password
  // 'success' → done!
  // 'error'   → show an error

  const navigate = useNavigate()

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          // Supabase automatically signs you into a one-time recovery session
          setStatus('ready')
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    setStatus('updating')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      console.error('Reset error:', error.message)
      setStatus('error')
    } else {
      setStatus('success')
    }
  }

  if (status === 'loading') {
    return <div style={{ padding: '2rem' }}>Loading reset form…</div>
  }
  if (status === 'error') {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Sorry, something went wrong.</h2>
        <p>Please try your reset link again.</p>
      </div>
    )
  }
  if (status === 'success') {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Password Updated!</h2>
        <button className="btn" onClick={() => navigate('/login')}>
          Go to Login
        </button>
      </div>
    )
  }

  // status === 'ready'
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          minLength={6}
          required
          autoComplete="new-password"
          style={{ width: '100%', padding: '.5rem', marginBottom: '1rem' }}
        />
        <button className="btn" type="submit">
          Update Password
        </button>
      </form>
    </div>
  )
}
