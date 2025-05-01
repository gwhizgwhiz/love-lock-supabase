import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import supabase from '../supabaseClient'

export default function Inbox() {
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [query, setQuery]     = useState('')

  useEffect(() => {
    supabase
      .from('inbox_with_profile_view')
      .select(`
        thread_id,
        other_user_name,
        other_user_slug,
        other_user_avatar_url,
        unread_count,
        last_message,
        last_message_at
      `)
      .order('last_message_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Inbox load error:', error)
          setError('Could not load your inbox.')
        } else {
          setThreads(data)
        }
        setLoading(false)
      })
  }, [])

  // client-side filter
  const filtered = threads.filter(t =>
    t.other_user_name.toLowerCase().includes(query.toLowerCase()) ||
    (t.last_message || '').toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="inbox-container">
      <div className="inbox-card">
        <h1>Inbox</h1>

        <div className="inbox-controls" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
          <Link to="/compose" className="btn-outline btn-small">
            New Message
          </Link>
          <input
            type="search"
            placeholder="Search messages…"
            className="input-field"
            style={{ flex: 1 }}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        {loading && <div className="spinner" />}
        {error   && <p className="empty-state">{error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <p className="empty-state">No conversations yet.</p>
        )}

        <ul className="message-list">
          {!loading && !error && filtered.map(t => (
            <li key={t.thread_id} className="message-item">
              <Link to={`/threads/${t.thread_id}`}>
                <h2>
                  {t.other_user_name}
                  {t.unread_count > 0 && (
                    <span
                      style={{
                        marginLeft: '0.5rem',
                        background: 'var(--brand-red)',
                        color: 'white',
                        borderRadius: '1em',
                        padding: '0 .5em',
                        fontSize: '0.8em'
                      }}
                    >
                      {t.unread_count}
                    </span>
                  )}
                </h2>
                {t.last_message && <p>{t.last_message}</p>}
                <p style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>
                  {new Date(t.last_message_at).toLocaleString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
