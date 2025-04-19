// src/pages/ProfileDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link }            from 'react-router-dom';
import supabase                       from '../supabaseClient';
import '../App.css';

export default function ProfileDetail() {
  const { slug } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .rpc('rpc_get_public_profile', { slug });
      if (error) {
        setError(error.message);
      } else {
        setProfile(data[0] || null);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div className="spinner" />;
  if (error)   return <p className="empty-state">{error}</p>;
  if (!profile) return <p className="empty-state">Profile not found.</p>;

  return (
    <div className="inbox-container">
      <div className="inbox-card">
        <h1>{profile.main_alias}</h1>
        <p>Region: {profile.known_region}</p>
        <p>Trust Score: {profile.trust_score}</p>
        <p>Badge: {profile.trust_badge}</p>
        <p>Total Interactions: {profile.shareable_count}</p>
        <Link to="/profiles" className="btn">← Back to Search</Link>
      </div>
    </div>
  );
}
