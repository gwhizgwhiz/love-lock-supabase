// src/pages/Compose.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate }                 from 'react-router-dom'
import supabase                       from '../supabaseClient'

export default function Compose() {
  const [users, setUsers]         = useState([])
  const [toUser, setToUser]       = useState('')
  const [text, setText]           = useState('')
  const [loading, setLoading]     = useState(true)
  const [sending, setSending]     = useState(false)
  const [error, setError]         = useState(null)
  const [currentUserId, setCurrentUserId] = useState(null)
  const navigate                  = useNavigate()

  // 1) Load the current user, then load everyone else
  useEffect(() => {
    async function loadUsers() {
      const { data: { user }, error: userErr } = await supabase.auth.getUser()
      if (userErr) {
        setError('Could not get current user.')
        setLoading(false)
        return
      }
      setCurrentUserId(user.id)

      const { data, error: listErr } = await supabase
        .from('person_of_interest')
        .select('created_by, slug')
        .neq('created_by', user.id)

      if (listErr) {
        setError('Could not load users.')
      } else {
        setUsers(data)
      }
      setLoading(false)
    }
    loadUsers()
  }, [])

  // 2) Handle form submit
  const handleSubmit = async e => {
    e.preventDefault()
    if (!toUser || !text.trim()) return
    setSending(true)
    setError(null)

    try {
      // Create the thread
      const { data: threads, error: threadErr } = await supabase
        .from('message_threads')
        .insert({ other_user_id: toUser })
        .select('thread_id')
      if (threadErr) throw threadErr
      const thread_id = threads[0].thread_id

      // Send the first message
      const { error: msgErr } = await supabase.rpc('send_message', {
        p_thread_id: thread_id,
        p_text: text.trim(),
      })
      if (msgErr) throw msgErr

      // Go into the new conversation
      navigate(`/threads/${thread_id}`)
    } catch (err) {
      console.error(err)
      setError(err.message)
      setSending(false)
    }
  }

  // 3) Loading state
  if (loading) return <div className="spinner" />

  return (
    <div className="inbox-container">
      <div className="inbox-card">
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
              {users.map(u => (
                <option key={u.created_by} value={u.created_by}>
                  {u.slug}
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
            <p style={{ color: 'var(--brand-red)', marginTop: '.5rem' }}>
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
