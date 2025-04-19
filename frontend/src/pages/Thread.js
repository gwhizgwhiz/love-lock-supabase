// src/Thread.js

import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import supabase from '../supabaseClient';  // Use the default import, not named import

const Thread = () => {
  const { threadId } = useParams();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('thread_id', threadId);

        if (error) throw error;
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [threadId]);

  return (
    <div>
      <h1>Thread {threadId}</h1>
      <ul>
        {messages.map((message) => (
          <li key={message.id}>
            <p>{message.content}</p>
            <small>{message.created_at}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Thread;
