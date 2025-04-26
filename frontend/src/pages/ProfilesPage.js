// frontend/src/pages/ProfilesPage.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import supabase from '../supabaseClient';
import '../App';

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState('');

  useEffect(() => {
    async function loadProfiles() {
      setLoading(true);
      const { data, error } = await supabase
        .from('public_profile_view_shared')
        .select('poi_id,slug,main_alias,photo_reference_url,trust_score,known_region');
      if (error) setError(error.message);
      else setProfiles(data);
      setLoading(false);
    }
    loadProfiles();
  }, []);

  // client‐side filter
  const q = search.toLowerCase();
  const filtered = profiles.filter(p =>
    p.main_alias.toLowerCase().includes(q) ||
    p.slug.toLowerCase().includes(q) ||
    (p.known_region || '').toLowerCase().includes(q)
  );

  if (loading) return <div className="spinner">Loading…</div>;
  if (error)   return <p className="empty-state">{error}</p>;

  return (
    <div className="profiles-container">
      <h2>Browse Profiles</h2>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name, slug or region…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="empty-state">No profiles match your search.</p>
      ) : (
        <div className="profiles-grid">
          {filtered.map(p => {
            // clamp to non-negative hearts
            const hearts = Math.max(0, Math.round(p.trust_score || 0));
            return (
              <Link
                key={p.poi_id}
                to={`/profiles/${p.slug}`}
                className="profile-card"
              >
                <img
                src={p.photo_reference_url || '/default-avatar.png'}
                alt={p.main_alias}
                className="profile-avatar"
              />
                <h3>{p.main_alias}</h3>
                <div className="trust-score">
                  {'❤️'.repeat(hearts)}
                  <span className="score-number">
                    {(p.trust_score || 0).toFixed(1)}
                  </span>
                </div>
                {p.known_region && (
                  <small className="region">{p.known_region}</small>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
