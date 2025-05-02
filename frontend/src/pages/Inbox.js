// src/pages/Inbox.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import supabase from '../supabaseClient'

export default function Inbox() {
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('inbox_with_profile_view')
        .select(`
          thread_id,
          unread_count,
          last_message_at,
          other_user_id,
          other_user_name,
          other_user_slug,
          other_user_avatar_url
        `)
        .order('last_message_at', { ascending: false })

      if (error) {
        console.error('Inbox load error:', error)
        setError('Could not load your inbox.')
      } else {
        setThreads(data)
      }
      setLoading(false)
    })()
  }, [])

  if (loading)   return <div className="spinner" />
  if (error)     return <div className="empty-state" style={{ color: 'red' }}>{error}</div>

  return (
    <div className="inbox-container">
      <div className="inbox-card">
        {/* ——— HEADER BAR ——— */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '1.5rem',
            gap: '1rem',
          }}
        >
          {/* NEW MESSAGE */}
          <Link to="/compose" className="btn">
            New Message
          </Link>
          {/* SEARCH */}
          <input
            type="text"
            placeholder="Search messages…"
            className="input-field"
            style={{ flex: 1 }}
          />
        </div>

        {/* ——— EMPTY STATE ——— */}
        {threads.length === 0 && (
          <div className="empty-state">No conversations yet.</div>
        )}

        {/* ——— THREAD LIST ——— */}
        {threads.length > 0 && (
          <ul className="message-list">
            {threads.map(t => (
              <li key={t.thread_id} className="message-item">
                <Link
                  to={`/threads/${t.thread_id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <img
                    src={t.other_user_avatar_url}
                    alt={`${t.other_user_name} avatar`}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginRight: '0.75rem',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <strong>{t.other_user_name}</strong>
                      {t.unread_count > 0 && (
                        <span
                          style={{
                            marginLeft: '0.5rem',
                            background: 'var(--brand-red)',
                            color: 'white',
                            borderRadius: '1em',
                            padding: '0 .5em',
                            fontSize: '0.8em',
                          }}
                        >
                          {t.unread_count}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8em', color: '#666' }}>
                      Last message:{' '}
                      {new Date(t.last_message_at).toLocaleString()}
                    </div>
                  </div>
                </Link>
                <Link
                  to={`/profiles/${t.other_user_slug}`}
                  style={{ marginLeft: '1rem' }}
                  title="View profile"
                >
                  View Profile
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
