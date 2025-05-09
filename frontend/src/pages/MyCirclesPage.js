// src/pages/MyCirclesPage.jsx
import React              from 'react';
import { useMyCircles }   from '../hooks/useCircles';
import { Link }           from 'react-router-dom';
import CircleForm         from '../components/CircleForm';

export default function MyCirclesPage() {
  const { circles, loading, error, refetch } = useMyCircles();

  if (loading) return <p>Loading your circles…</p>;
  if (error)   return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>My Circles</h1>
      <CircleForm onCreated={refetch} />
      <button onClick={refetch}>Refresh</button>
      <ul>
      {circles.map(c => (
          <li key={c.id}>
            <Link to={`/circles/${c.slug}`}>
              {c.icon} <strong>{c.name}</strong> — {c.city}, {c.state} ({c.zip})
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
