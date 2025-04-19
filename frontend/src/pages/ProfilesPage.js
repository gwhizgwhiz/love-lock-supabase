// src/pages/ProfilesPage.js
import React, { useState, useEffect } from 'react';
import { Link }                       from 'react-router-dom';
import supabase                       from '../supabaseClient';
import '../App.css';

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [filters, setFilters]   = useState({
    alias:   '',
    region:  '',
    badge:   '',
    platform:''
  });

  // Fetch either all or filtered
  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc(
        'search_profiles',
        {
          alias_filter:     filters.alias || null,
          region_filter:    filters.region || null,
          badge_filter:     filters.badge || null,
          platform_filter:  filters.platform || null,
          min_trust_score:  null,
          min_sentiment:    null,
          min_interactions: null
        }
      );
      if (error) throw error;
      setProfiles(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleChange = e => {
    setFilters(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSearch = e => {
    e.preventDefault();
    load();
  };

  if (loading) return <div className="spinner" />;
  if (error)   return <p className="empty-state">{error}</p>;

  return (
    <div className="inbox-container">
      <div className="inbox-card">
        <h1>Find People</h1>

        <form onSubmit={handleSearch} className="profile-search-form">
          <input
            name="alias"
            value={filters.alias}
            onChange={handleChange}
            placeholder="Alias"
          />
          <input
            name="region"
            value={filters.region}
            onChange={handleChange}
            placeholder="Region"
          />
          <input
            name="badge"
            value={filters.badge}
            onChange={handleChange}
            placeholder="Badge"
          />
          <input
            name="platform"
            value={filters.platform}
            onChange={handleChange}
            placeholder="Platform"
          />
          <button className="btn" type="submit">Search</button>
        </form>

        {profiles.length === 0 ? (
          <p className="empty-state">No profiles found.</p>
        ) : (
          <ul className="message-list">
            {profiles.map(p => (
              <li key={p.poi_id} className="message-item">
                <Link to={`/profiles/${p.slug}`}>
                  <strong>{p.main_alias}</strong>
                  <p>Badge: {p.trust_badge}</p>
                  <small>Region: {p.known_region}</small>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
