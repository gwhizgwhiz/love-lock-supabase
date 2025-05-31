// frontend/src/pages/PersonsOfInterestPage.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import supabase from '../supabaseClient';
import useCurrentUser from '../hooks/useCurrentUser';
import resolveAvatarUrl from '../lib/resolveAvatarUrl';
import '../App.css';

export default function PersonsOfInterestPage() {
  const { userId, loading } = useCurrentUser();
  const [pois, setPois] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (loading) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('person_of_interest')
          .select('id, trust_badge, main_alias, avatar_url, city, state, trust_score, created_by, is_public')
          .eq('is_public', true)

        if (error) throw error;

        const resolvedPois = await Promise.all(
          (data || []).map(async p => ({
            id: p.id,
            name: p.trust_badge || p.main_alias || '',
            avatar_url: await resolveAvatarUrl(p.avatar_url),
            city: p.city || '',
            state: p.state || '',
            trust_score: Number(p.trust_score) || 0,
            createdBy: p.created_by
          }))
        );

        setPois(resolvedPois);
      } catch (err) {
        console.error('Error loading POIs:', err);
        setError(err.message || 'Could not load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [loading]);

  const term = search.trim().toLowerCase();
  const filteredPois = pois.filter(p =>
    p.name.toLowerCase().includes(term) ||
    (`${p.city}, ${p.state}`).toLowerCase().includes(term)
  );

  if (loading || isLoading) {
  return (
    <div className="loading-container">
      <div className="loading-logo" />
    </div>
);
}

  if (error) return <p className="empty-state">{error}</p>;

  const Hearts = ({ score }) => (
    <div className="trust-score">
      {'❤️'.repeat(Math.max(0, Math.min(5, Math.round(score))))}
      <span className="score-number">{score.toFixed(1)}</span>
    </div>
  );

  return (
    <div className="container">
      <h2>Persons of Interest</h2>

      <div className="controls">
        <input
          className="search-input"
          type="text"
          placeholder="Search by name, city, or state…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filteredPois.length === 0 ? (
        <p className="empty-state">No persons of interest found.</p>
      ) : (
        <div className="poi-grid">
  {filteredPois.map(p => (
    <Link key={p.id} to={`/profiles/${p.id}`} className="poi-card">
    <div className="poi-badge-container">
        {p.createdBy === userId && <span className="badge">This is you</span>}
    </div>
    <img src={p.avatar_url} alt={p.name || 'POI'} className="poi-avatar" />
    <div className="poi-name">{p.name || 'Unnamed'}</div>
    <div className="poi-trust">Trust: {p.trust_score.toFixed(1)}</div>
    <div className="poi-location">{p.city || '—'}, {p.state}</div>
    </Link>
    ))}
    </div>
      )}
    </div>
  );
}
