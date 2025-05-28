// src/pages/Thread.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import supabase from '../supabaseClient';
import useCurrentUser from '../hooks/useCurrentUser';
import '../App.css';

export default function Thread() {
  const { threadId } = useParams();
  const { userId, loading: userLoading } = useCurrentUser();
  const [messages, setMessages] = useState([]);
  const [newText, setNewText] = useState('');
  const [loading, setLoading] = useState(true);

  // Load messages
  useEffect(() => {
    if (!threadId) return;

    const loadMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('message')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) console.error('Error fetching messages:', error);
      else setMessages(data || []);
      setLoading(false);
    };

    loadMessages();
  }, [threadId]);

  // Send a reply
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newText.trim() || !threadId || !userId) return;

    const { data, error } = await supabase
      .from('message')
      .insert([{ thread_id: threadId, text: newText.trim(), sender_id: userId }])
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setMessages((prev) => [...prev, data]);
      setNewText('');
    }
  };

  // Delete your own message
  const deleteMessage = async (id) => {
    const { error } = await supabase.from('message').delete().eq('id', id);
    if (error) {
      console.error('Error deleting message:', error);
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }
  };

  if (loading || userLoading) return <div style={{ padding: 16 }}>Loading conversation…</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1>Conversation</h1>
      <div style={{ maxHeight: '60vh', overflowY: 'auto', marginBottom: 16 }}>
        {messages.map((m) => {
          const isOwn = m.sender_id === userId;
          return (
            <div
              key={m.id}
              style={{
                margin: '8px 0',
                textAlign: isOwn ? 'right' : 'left',
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  background: isOwn ? '#DCF8C6' : '#FFF',
                  padding: '8px 12px',
                  borderRadius: 12,
                  position: 'relative',
                }}
              >
                {m.text}
                {isOwn && (
                  <button
                    onClick={() => deleteMessage(m.id)}
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      background: 'transparent',
                      border: 'none',
                      color: '#999',
                      cursor: 'pointer',
                    }}
                    title="Delete"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div style={{ fontSize: '0.75em', color: '#666' }}>
                {new Date(m.created_at).toLocaleTimeString()}
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={sendMessage}>
        <textarea
          rows={3}
          style={{ width: '100%', padding: 8 }}
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Type your message…"
          required
        />
        <button className="btn" type="submit" style={{ marginTop: 8 }}>
          Send
        </button>
      </form>
    </div>
  );
}
