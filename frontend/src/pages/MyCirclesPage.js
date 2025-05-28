// src/pages/MyCirclesPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import useCurrentUser from '../hooks/useCurrentUser';
import '../App.css';

export default function MyCirclesPage() {
  const navigate = useNavigate();
  const { userId, loading: userLoading } = useCurrentUser();

  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userLoading || !userId) return;

    const loadCircles = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('circles')
        .select('*')
        .eq('created_by', userId);

      if (error) {
        setError(error);
      } else {
        setCircles(data || []);
      }
      setLoading(false);
    };

    loadCircles();
  }, [userId, userLoading]);

  if (loading || userLoading) return <p>Loading your circles…</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <main className="container">
      <h1>My Circles</h1>
      <button
        className="btn btn-small btn-outline"
        onClick={() => navigate('/create-circle')}
      >
        Create Circle
      </button>

      {circles.length === 0 ? (
        <p>You have no circles yet.</p>
      ) : (
        <div className="circle-map">
          {circles.map(c => (
            <div
              key={c.id}
              className="circle-item jitter"
              onClick={() => navigate(`/circles/${c.slug}`)}
            >
              <span className="circle-icon">{c.icon}</span>
              <div className="circle-name">{c.name}</div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
