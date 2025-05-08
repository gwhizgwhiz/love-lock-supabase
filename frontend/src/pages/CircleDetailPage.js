// src/pages/CircleDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CircleService }   from '../lib/circles';
import { useCircleMembers } from '../hooks/useCircles';

export default function CircleDetailPage() {
  const { circleId } = useParams();
  const [circle, setCircle] = useState(null);
  const [loadingCircle, setLoadingCircle] = useState(true);
  const [errorCircle, setErrorCircle] = useState(null);

  const { members, loading: loadingMembers, error: errorMembers } =
    useCircleMembers(circleId);

  useEffect(() => {
    async function fetchCircle() {
      setLoadingCircle(true);
      const { data, error } = await CircleService.getCircle(circleId);
      setCircle(data);
      setErrorCircle(error);
      setLoadingCircle(false);
    }
    fetchCircle();
  }, [circleId]);

  if (loadingCircle) return <p>Loading circle…</p>;
  if (errorCircle)  return <p>Error: {errorCircle.message}</p>;
  if (!circle)      return <p>Circle not found.</p>;

  return (
    <div>
      <h1>
        {circle.icon} {circle.name}
      </h1>
      <p>
        Location: {circle.city}, {circle.state} ({circle.zip})<br/>
        Type: {circle.type}<br/>
        Created by: {circle.created_by}
      </p>

      <h2>Members</h2>
      {loadingMembers && <p>Loading members…</p>}
      {errorMembers && <p>Error: {errorMembers.message}</p>}
      {!loadingMembers && !errorMembers && (
        <ul>
          {members.map(m => (
            <li key={m.id}>
              {m.user_id} — <em>{m.role}</em>
            </li>
          ))}
        </ul>
      )}

      <Link to="/my-circles">← Back to My Circles</Link>
    </div>
  );
}
