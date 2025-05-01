import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../supabaseClient'

export default function ResetRequest() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setStatus('sending')
    const { error } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: window.location.origin + '/reset-password' }
    )
    if (error) {
      console.error('Reset request error:', error.message)
      setStatus('error')
    } else {
      setStatus('sent')
    }
  }

  if (status === 'sent') {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Check your inbox</h2>
        <p>We’ve emailed you a link to reset your password.</p>
        <button onClick={() => navigate('/login')}>Back to Login</button>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: '.5rem', marginBottom: '1rem' }}
        />
        <button className="btn" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send Reset Link'}
        </button>
      </form>
      {status === 'error' && (
        <p style={{ color: 'red', marginTop: '1rem' }}>
          Could not send reset email. Check your address and try again.
        </p>
      )}
    </div>
  )
}
