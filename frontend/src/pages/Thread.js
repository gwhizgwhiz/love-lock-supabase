import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import supabase from '../supabaseClient'
import '../App.css'

export default function Thread() {
  const { threadId } = useParams()
  const [messages, setMessages] = useState([])
  const [newText, setNewText]   = useState('')
  const [loading, setLoading]   = useState(true)

  // Load history
  useEffect(() => {
    if (!threadId) return
    supabase
      .from('my_message_history_view')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) console.error(error)
        else setMessages(data)
        setLoading(false)
      })
  }, [threadId])

  // Send a reply
  const sendMessage = async e => {
    e.preventDefault()
    if (!newText.trim()) return
    await supabase.rpc('send_message', {
      p_thread_id: threadId,
      p_text: newText.trim(),
    })
    setNewText('')
    // refresh
    const { data } = await supabase
      .from('my_message_history_view')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })
    setMessages(data)
  }

  // Delete your own message
  const deleteMessage = async id => {
    await supabase
      .from('message')
      .delete()
      .eq('id', id)
    // refresh
    setMessages(prev => prev.filter(m => m.id !== id))
  }

  if (loading) return <div style={{ padding: 16 }}>Loading conversation…</div>

  return (
    <div style={{ padding: 16 }}>
      <h1>Conversation</h1>
      <div style={{ maxHeight: '60vh', overflowY: 'auto', marginBottom: 16 }}>
        {messages.map(m => {
          const isOwn = m.sender_id === supabase.auth.getUser().data.user.id
          return (
            <div
              key={m.id}
              style={{
                margin: '8px 0',
                textAlign: isOwn ? 'right' : 'left'
              }}
            >
              <div style={{
                display: 'inline-block',
                background: isOwn ? '#DCF8C6' : '#FFF',
                padding: '8px 12px',
                borderRadius: 12,
                position: 'relative',
              }}>
                {m.text}
                {isOwn && (
                  <button
                    onClick={() => deleteMessage(m.id)}
                    style={{
                      position: 'absolute',
                      top: -8, right: -8,
                      background: 'transparent',
                      border: 'none',
                      color: '#999',
                      cursor: 'pointer'
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
          )
        })}
      </div>
      <form onSubmit={sendMessage}>
        <textarea
          rows={3}
          style={{ width: '100%', padding: 8 }}
          value={newText}
          onChange={e => setNewText(e.target.value)}
          placeholder="Type your message…"
          required
        />
        <button className="btn" type="submit" style={{ marginTop: 8 }}>
          Send
        </button>
      </form>
    </div>
  )
}
