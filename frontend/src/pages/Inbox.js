import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import supabase from '../supabaseClient';
import useCurrentUser from '../hooks/useCurrentUser';
import resolveAvatarUrl from '../lib/resolveAvatarUrl';

import '../App.css';

export default function Inbox() {
  const { userId, loading: userLoading } = useCurrentUser();
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
        const { data: threads, error: threadsError } = await supabase
          .from('message_threads')
          .select('*, messages(*)')
          .or(`user_one.eq.${userId},user_two.eq.${userId}`)
          .order('updated_at', { ascending: false });

        if (threadsError) throw threadsError;

        const mappedThreads = await Promise.all(
          (threads || []).map(async (thread) => {
            const otherUserId = [thread.user_one, thread.user_two].find(id => id && id !== userId);

          if (!otherUserId) {
            console.warn('⚠️ Could not resolve other participant from thread:', thread);
            return null; // Skip this thread
          }

            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('name, slug, avatar_url')
              .eq('user_id', otherUserId)
              .single();

            if (profileError) {
              console.warn('Profile fetch error:', profileError);
              return null;
            }

            const { count, error: countError } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('receiver_id', userId)
              .eq('message_thread_id', thread.id)
              .is('read_at', null);

            if (countError) {
              console.warn('Unread count error:', countError);
            }

            const avatar = await resolveAvatarUrl(profileData.avatar_url);

            return {
              thread_id: thread.id,
              last_message_at: thread.updated_at || thread.last_message_at,
              unread_count: count || 0,
              other_user_name: `${profileData.name}`,
              other_user_slug: profileData.slug,
              other_user_avatar_url: avatar,
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
        <div className="inbox-header">
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
                <Link to={`/threads/${t.thread_id}`} className="message-item-link">
                  <img
                    className="avatar-menu-avatar"
                    src={t.other_user_avatar_url}
                    alt={`${t.other_user_name} avatar`}
                  />
                  <div className="message-details">
                    <div className="message-meta">
                      <strong>{t.other_user_name}</strong>
                      {t.unread_count > 0 && (
                        <span className="message-unread-badge">
                          {t.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="message-timestamp">
                      Last message: {new Date(t.last_message_at).toLocaleString()}
                    </div>
                  </div>
                </Link>
                <Link to={`/profiles/${t.other_user_slug}`} className="profile-link" title="View profile">
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
