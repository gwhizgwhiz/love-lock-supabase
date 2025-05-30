// src/pages/Inbox.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import supabase from '../supabaseClient';
import useCurrentUser from '../hooks/useCurrentUser';
import '../App.css';

export default function Inbox() {
  const { userId, profile, slug, avatarUrl, loading: userLoading } = useCurrentUser();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const fetchInbox = async () => {
      if (userLoading || !userId) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch threads where the user is a participant
        const { data: threadsData, error: threadsError } = await supabase
          .from('message_threads')
          .select('id, user_one, user_two, last_message_at')
          .or(`user_one.eq.${userId},user_two.eq.${userId}`)
          .order('last_message_at', { ascending: false });


        if (threadsError) throw threadsError;

        // Map threads to include other user's profile info
        const mappedThreads = await Promise.all(
          (threadsData || []).map(async (thread) => {
            const otherUserId = thread.user_one === userId ? thread.user_two : thread.user_one;

            // Fetch the other user's profile
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('first_name, last_name, slug, avatar_url')
              .eq('user_id', otherUserId)
              .single();

            if (profileError) {
              console.warn('Profile fetch error:', profileError);
              return null;
            }

            // Fetch unread count for this thread
            const { count, error: countError } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('receiver_id', userId)
              .eq('message_thread_id', thread.id)
              .is('read_at', null);

            if (countError) {
              console.warn('Unread count error:', countError);
            }

            return {
              thread_id: thread.id,
              last_message_at: thread.last_message_at,
              unread_count: count || 0,
              other_user_name: `${profileData.first_name} ${profileData.last_name}`,
              other_user_slug: profileData.slug,
              other_user_avatar_url: profileData.avatar_url || '/default-avatar.png',
            };
          })
        );

        setThreads(mappedThreads.filter(Boolean));
      } catch (err) {
        console.error('Inbox load error:', err);
        setError('Could not load your inbox.');
      }

      setLoading(false);
    };

    fetchInbox();
  }, [userId, userLoading]);

  const filteredThreads = threads.filter(t =>
    t.other_user_name.toLowerCase().includes(searchInput.toLowerCase()) ||
    t.other_user_slug.toLowerCase().includes(searchInput.toLowerCase())
  );

  if (loading) return <div className="spinner">Loading…</div>;
  if (error) return <div className="empty-state" style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="inbox-container">
      <div className="inbox-card">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
          <Link to="/compose" className="btn">New Message</Link>
          <input
            type="text"
            placeholder="Search messages…"
            className="input-field"
            style={{ flex: 1 }}
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
        </div>

        {filteredThreads.length === 0 && (
          <div className="empty-state">No conversations yet.</div>
        )}

        {filteredThreads.length > 0 && (
          <ul className="message-list">
            {filteredThreads.map(t => (
              <li key={t.thread_id} className="message-item">
                <Link to={`/threads/${t.thread_id}`} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                  <img
                    src={t.other_user_avatar_url}
                    alt={`${t.other_user_name} avatar`}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', marginRight: '0.75rem' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <strong>{t.other_user_name}</strong>
                      {t.unread_count > 0 && (
                        <span style={{ marginLeft: '0.5rem', background: 'var(--brand-red)', color: 'white', borderRadius: '1em', padding: '0 .5em', fontSize: '0.8em' }}>
                          {t.unread_count}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8em', color: '#666' }}>
                      Last message: {new Date(t.last_message_at).toLocaleString()}
                    </div>
                  </div>
                </Link>
                <Link to={`/profiles/${t.other_user_slug}`} style={{ marginLeft: '1rem' }} title="View profile">
                  View Profile
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
