// src/pages/Compose.jsx

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import supabase from '../supabaseClient';
import useCurrentUser from '../hooks/useCurrentUser';
import '../App.css';

export default function Compose() {
  const { userId, loading: userLoading } = useCurrentUser();
  const [users, setUsers] = useState([]);
  const [toUserId, setToUserId] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Load other users for messaging (exclude self)
  useEffect(() => {
    if (userLoading || !userId) return;

    const loadUsers = async () => {
      setError(null);
      try {
        const { data, error: loadError } = await supabase
          .from('profiles')
          .select('user_id, name, avatar_url')
          .neq('user_id', userId)
          .order('user_id', { ascending: true });

        if (loadError) throw loadError;
        setUsers(data || []);
      } catch (err) {
        console.error('Load users error:', err);
        setError('Could not load users.');
      }
    };

    loadUsers();
  }, [userLoading, userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!toUserId || !text.trim()) {
      setError('Please select a recipient and enter a message.');
      return;
    }

    setSending(true);
    setError(null);

    try {
      let threadId;

      const { data: insertedThread, error: insertError } = await supabase
        .from('message_threads')
        .insert({ user_one: userId, user_two: toUserId })
        .select('id');

      if (insertError && insertError.code !== '23505') throw insertError;

      threadId = insertedThread?.[0]?.id;

      if (!threadId) {
        const { data: existingThreads, error: existingError } = await supabase
          .from('message_threads')
          .select('id')
          .or(`and(user_one.eq.${userId},user_two.eq.${toUserId}),and(user_one.eq.${toUserId},user_two.eq.${userId})`)
          .limit(1);

        if (existingError) throw existingError;
        if (!existingThreads) throw new Error('Unable to find or create thread.');
        threadId = existingThreads[0].id;
      }

      const { error: messageError } = await supabase.rpc('send_message', {
        sender: userId,
        recipient: toUserId,
        message_text: text.trim(),
        reply_to: null,          // or set if replying to a specific message
        poi: null,               // or set the POI id if linking to a person of interest
      });

      if (messageError) throw messageError;

      navigate(`/threads/${threadId}`);
    } catch (err) {
      console.error('Compose error:', err);
      setError(err.message || 'An error occurred.');
    } finally {
      setSending(false);
    }
  };

  if (userLoading) return <div className="spinner">Loading…</div>;

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
              value={toUserId}
              onChange={(e) => setToUserId(e.target.value)}
              required
            >
              <option value="">— Select a user —</option>
              {users.map((u) => (
                <option key={u.user_id} value={u.user_id}>
                  {u.name}
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
              onChange={(e) => setText(e.target.value)}
              placeholder="Write your message…"
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
