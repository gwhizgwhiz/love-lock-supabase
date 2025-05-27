// src/pages/Compose.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import supabase from '../supabaseClient';
import useAuth from '../hooks/useAuth';

export default function Compose() {
  const { user, loading: authLoading } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [toUser, setToUser] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Load all users except self for selection
  useEffect(() => {
    if (authLoading || !user) return;
    supabase
      .from('person_of_interest')
      .select('created_by, slug')
      .neq('created_by', user.id)
      .then(({ data, error }) => {
        if (error) {
          console.error('Load profiles error:', error);
          setError('Could not load users.');
        } else {
          setProfiles(data);
        }
      });
  }, [authLoading, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!toUser || !text.trim()) return;

    setSending(true);
    setError(null);

    try {
      // Create thread
      const { data: threads, error: threadErr } = await supabase
        .from('message_threads')
        .insert({ user_one: user.id, user_two: toUser })
        .select('id');
      if (threadErr) throw threadErr;
      const threadId = threads[0].id;

      // Send first message via RPC
      const { error: msgErr } = await supabase.rpc('send_message', {
        p_thread_id: threadId,
        p_text: text.trim(),
      });
      if (msgErr) throw msgErr;

      navigate(`/threads/${threadId}`);
    } catch (err) {
      console.error('Compose error:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setSending(false);
    }
  };

  if (authLoading) return <div className="spinner" />;

  return (
    <div className="inbox-container">
      <div className="inbox-card">
        <Link to="/inbox" className="btn btn-small" style={{
          background: 'transparent', color: 'var(--brand-red)', border: '2px solid var(--brand-red)'
        }}>
          ← Back to Inbox
        </Link>

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

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn" disabled={sending} style={{ marginTop: '1rem' }}>
            {sending ? 'Sending…' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
