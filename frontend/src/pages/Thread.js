// src/pages/Thread.jsx
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import supabase from '../supabaseClient';
import useCurrentUser from '../hooks/useCurrentUser';
import resolveAvatarUrl from '../lib/resolveAvatarUrl';
import '../App.css';

export default function Thread() {
  const { threadId } = useParams();
  const { userId, loading: userLoading } = useCurrentUser();
  const [messages, setMessages] = useState([]);
  const [newText, setNewText] = useState('');
  const [loading, setLoading] = useState(true);
  const [recipientId, setRecipientId] = useState(null);
  const [recipientName, setRecipientName] = useState('');
  const [recipientAvatar, setRecipientAvatar] = useState('');
  const bottomRef = useRef(null);

  // Load messages
  useEffect(() => {
    if (!threadId) return;

    const loadMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:profiles!messages_sender_id_profiles_fkey(name, avatar_url)')
        .eq('message_thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
      } else {
        setMessages(data || []);

        const participantIds = data
          .map(m => [m.sender_id, m.receiver_id])
          .flat()
          .filter(Boolean);
        const otherId = participantIds.find(id => id !== userId);
        if (otherId) {
          setRecipientId(otherId);

          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('name, avatar_url')
            .eq('user_id', otherId)
            .single();

          if (!profileError && profile) {
            setRecipientName(profile.name);
            const avatarUrl = await resolveAvatarUrl(profile.avatar_url);
            setRecipientAvatar(avatarUrl);
          }
        }
      }
      setLoading(false);
    };

    loadMessages();
  }, [threadId, userId]);

  // Subscribe to all inserts, then filter inside handler
  useEffect(() => {
    if (!threadId) return;

    const channel = supabase
      .channel(`thread-messages-${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        payload => {
          const newMsg = payload.new;
          if (newMsg.message_thread_id === threadId) {
            setMessages(prev => {
              if (prev.some(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId]);

  // Mark messages as read
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!userId || !threadId) return;

      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('message_thread_id', threadId)
        .eq('receiver_id', userId)
        .is('read_at', null);

      if (error) console.warn('Failed to mark as read:', error);
    };

    markMessagesAsRead();
  }, [userId, threadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send a reply using RPC
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newText.trim() || !threadId || !userId || !recipientId) return;

    const { error } = await supabase.rpc('send_message', {
      sender: userId,
      recipient: recipientId,
      message_text: newText.trim(),
      reply_to: null,
      poi: null,
    });

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setNewText('');
    }
  };

  if (loading || userLoading) return <div className="container thread-container">Loading conversation…</div>;

  return (
    <div className="container thread-container">
      <div className="conversation-header">
        {recipientAvatar && <img src={recipientAvatar} alt="avatar" className="poi-avatar" />}
        <p className="section-header">Conversation with {recipientName || '...'}</p>
      </div>
      <div className="message-thread">
        {messages.map((m) => {
          const isOwn = m.sender_id === userId;
          return (
            <div
              key={m.id}
              className={`message-bubble ${isOwn ? 'own-message' : 'their-message'}`}
            >
              <div className="message-content">{m.content}</div>
              {!isOwn && (
                <div className="message-sender">{m.sender?.name}</div>
              )}
              <div className="message-time">{new Date(m.created_at).toLocaleTimeString()}</div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form className="message-form" onSubmit={sendMessage}>
        <textarea
          rows={3}
          className="message-input"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Type your message…"
          required
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage(e);
            }
          }}
        />
        <button className="btn" type="submit">
          Send
        </button>
      </form>
    </div>
  );
}
