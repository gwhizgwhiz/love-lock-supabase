// src/pages/Inbox.js

import React, { useState, useEffect } from 'react';
import { useNavigate }                from 'react-router-dom';
import supabase                       from '../supabaseClient';
import '../App.css';

export default function Inbox() {
  const [user, setUser]               = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [profiles, setProfiles]       = useState([]);
  const [selectedReceiver, setSelectedReceiver] = useState('');
  const [messages, setMessages]       = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const [newMessage, setNewMessage]   = useState('');
  const [error, setError]             = useState(null);
  const navigate                      = useNavigate();

  // 1️⃣ Auth & email‑verification guard
  useEffect(() => {
    (async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error)        return setError('Auth error');
      if (!user)        return navigate('/login', { replace: true });
      if (!user.email_confirmed_at) {
        return navigate('/verify-email', { replace: true });
      }
      setUser(user);
      setLoadingUser(false);
    })();
  }, [navigate]);

  // 2️⃣ Load only fully completed profiles
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from('public_profile_view')     // your completed‑profiles view
        .select('id, main_alias')        // id + display name
        .neq('id', user.id)              // exclude self
        .order('main_alias', { ascending: true });
      if (error) {
        console.error(error);
      } else {
        setProfiles(data);
        if (data[0]) setSelectedReceiver(data[0].id);
      }
    })();
  }, [user]);

  // 3️⃣ Fetch messages sent to you
  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoadingMsgs(true);
      const { data, error } = await supabase
        .from('message')
        .select('id, content, sent_at, sender_id')
        .eq('receiver_id', user.id)
        .order('sent_at', { ascending: false });
      if (error) setError('Failed to load messages');
      else      setMessages(data);
      setLoadingMsgs(false);
    })();
  }, [user]);

  // 4️⃣ Real‑time subscription
  useEffect(() => {
    if (!user) return;
    const chan = supabase
      .channel(`message:receiver_id=eq.${user.id}`)
      .on('postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'message',
          filter: `receiver_id=eq.${user.id}`
        },
        ({ new: msg }) => setMessages(curr => [msg, ...curr])
      )
      .subscribe();
    return () => supabase.removeChannel(chan);
  }, [user]);

  // 5️⃣ Send to selected profile only
  const handleSend = async e => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text || !selectedReceiver) return;
    if (selectedReceiver === user.id) {
      setError("You can’t message yourself.");
      return;
    }
    const { error } = await supabase
      .from('message')
      .insert({
        sender_id:   user.id,
        receiver_id: selectedReceiver,
        content:     text
      });
    if (error) setError('Send failed');
    else {
      setNewMessage('');
      setError(null);
    }
  };

  // 6️⃣ Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  // ─── RENDER ──────────────────
  if (loadingUser) return <div className="spinner" />;
  if (error)       return <p className="empty-state">{error}</p>;

  return (
    <div className="inbox-container">
      <div className="inbox-card">
        <h1>Inbox</h1>
        <p>Welcome, {user.email}</p>

        {/* Compose: only completed profiles appear */}
        {profiles.length > 0 && (
          <form onSubmit={handleSend} style={{ marginBottom: '1rem' }}>
            <select
              value={selectedReceiver}
              onChange={e => setSelectedReceiver(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: 4,
                border: '1px solid var(--border-light)',
                marginBottom: '0.5rem'
              }}
            >
              {profiles.map(p => (
                <option key={p.id} value={p.id}>
                  {p.main_alias}
                </option>
              ))}
            </select>
            <textarea
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Write your message…"
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 4,
                border: '1px solid var(--border-light)',
                marginBottom: '0.5rem'
              }}
            />
            <button type="submit" className="btn">
              Send Message
            </button>
          </form>
        )}

        {/* Message list */}
        {loadingMsgs ? (
          <div className="spinner" />
        ) : messages.length > 0 ? (
          <ul className="message-list">
            {messages.map(msg => (
              <li key={msg.id} className="message-item">
                <h2>{new Date(msg.sent_at).toLocaleString()}</h2>
                <p>{msg.content}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">No messages yet.</p>
        )}

        <button onClick={handleLogout} className="btn">
          Logout
        </button>
      </div>
    </div>
  );
}
