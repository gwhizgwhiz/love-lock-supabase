// src/pages/Inbox.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import supabase from '../supabaseClient'
import '../App.css'

export default function Inbox() {
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    const fetchInbox = async () => {
      setLoading(true)
      setError(null)

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (!user || userError) {
        setError('Unable to load user session.')
        setLoading(false)
        return
      }

      const { data, error: inboxError } = await supabase
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

      if (inboxError) {
        console.error('Inbox load error:', inboxError)
        setError('Could not load your inbox.')
      } else {
        setThreads(data)
      }
      setLoading(false)
    }

    fetchInbox()
  }, [])

  const filteredThreads = threads.filter(t =>
    t.other_user_name.toLowerCase().includes(searchInput.toLowerCase()) ||
    t.other_user_slug.toLowerCase().includes(searchInput.toLowerCase())
  )

  if (loading) return <div className="spinner">Loading…</div>
  if (error) return <div className="empty-state" style={{ color: 'red' }}>{error}</div>

  return (
    <div className="inbox-container">
      <div className="inbox-card">
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '1.5rem',
            gap: '1rem',
          }}
        >
          <Link to="/compose" className="btn">
            New Message
          </Link>
          <input
            type="text"
            placeholder="Search messages…"
            className="input-field"
            style={{ flex: 1 }}
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
        </div>

        {/* Empty State */}
        {filteredThreads.length === 0 && (
          <div className="empty-state">No conversations yet.</div>
        )}

        {/* Thread List */}
        {filteredThreads.length > 0 && (
          <ul className="message-list">
            {filteredThreads.map(t => (
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
                    src={t.other_user_avatar_url || '/default-avatar.png'}
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
