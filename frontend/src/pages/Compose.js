// src/pages/Compose.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, Link }           from 'react-router-dom'
import supabase                       from '../supabaseClient'
import useAuth                        from '../hooks/useAuth'

export default function Compose() {
  const { user, loading: authLoading } = useAuth()
  const [profiles, setProfiles]        = useState([])
  const [toUser, setToUser]            = useState('')
  const [text, setText]                = useState('')
  const [sending, setSending]          = useState(false)
  const [error, setError]              = useState(null)
  const navigate                       = useNavigate()

  // 1) Load everyone else
  useEffect(() => {
    if (authLoading || !user) return
    supabase
      .from('person_of_interest')
      .select('created_by, slug')
      .neq('created_by', user.id)
      .then(({ data, error }) => {
        if (error) {
          console.error('LOAD PROFILES ERROR', error)
          setError('Could not load users.')
        } else {
          setProfiles(data)
        }
      })
  }, [authLoading, user])

  // 2) Create thread + send first message (now with debug logs)
  const handleSubmit = async e => {
    e.preventDefault()
    console.log('🚀 handleSubmit()', { toUser, text, userId: user?.id })

    if (!toUser || !text.trim()) {
      console.warn('📋 Missing toUser or empty text, aborting.')
      return
    }

    setSending(true)
    setError(null)

    try {
      // A) Insert thread
      const { data: threads, error: threadErr } = await supabase
        .from('message_threads')
        .insert({ user_one: user.id, user_two: toUser })
        .select('id')
      console.log('🔨 thread insert result', { threads, threadErr })
      if (threadErr) throw threadErr
      const threadId = threads[0].id

      // B) RPC to send first message
      const { error: msgErr } = await supabase.rpc('send_message', {
        p_thread_id: threadId,
        p_text: text.trim(),
      })
      console.log('✉️ rpc send_message result', { msgErr })
      if (msgErr) throw msgErr

      // C) Navigate
      console.log('🎉 navigate to', `/threads/${threadId}`)
      navigate(`/threads/${threadId}`)
    } catch (err) {
      console.error('❌ COMPOSE ERROR', err)
      setError(err.message || 'Unknown error')
      setSending(false)
    }
  }

  if (authLoading) return <div className="spinner" />

  return (
    <div className="inbox-container">
      <div className="inbox-card">
        {/* Back link */}
        <div style={{ marginBottom: '1rem' }}>
          <Link to="/inbox" className="btn btn-small" style={{
            background:'transparent', color:'var(--brand-red)', border:'2px solid var(--brand-red)'
          }}>
            ← Back to Inbox
          </Link>
        </div>

        <h1>New Message</h1>
        <form onSubmit={handleSubmit} className="form">
          <label>
            To
            <select
              className="input-field"
              value={toUser}
              onChange={e => setToUser(e.target.value)}
              required
            >
              <option value="">— select a user —</option>
              {profiles.map(p => (
                <option key={p.created_by} value={p.created_by}>
                  {p.slug}
                </option>
              ))}
            </select>
          </label>

          <label>
            Message
            <textarea
              className="input-field"
              rows={4}
              value={text}
              onChange={e => setText(e.target.value)}
              required
            />
          </label>

          {error && (
            <p style={{ color: 'var(--brand-red)', marginTop: '0.5rem' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn"
            disabled={sending}
            style={{ marginTop: '1rem' }}
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  )
}
