// frontend/src/pages/ProfilesPage.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import supabase from '../supabaseClient';
import useCurrentUser from '../hooks/useCurrentUser';
import resolveAvatarUrl from '../lib/resolveAvatarUrl';
import '../App.css';

export default function ProfilesPage() {
  const { userId, loading } = useCurrentUser();  // 🔥 Cleaned up: no authLoading
  const [pois, setPois] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);  // Renamed for clarity
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showProfiles, setShowProfiles] = useState(false);

  useEffect(() => {
    if (loading) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [{ data: poiData, error: poiErr }, { data: profData, error: profErr }] = await Promise.all([
          supabase
            .from('person_of_interest')
            .select(`id, trust_badge, main_alias, avatar_url, city, state, trust_score, created_by, is_shareable, is_user_profile`)
            .eq('is_shareable', true)
            .eq('is_user_profile', false),
          supabase
            .from('profiles')
            .select(`id, user_id, name, avatar_url, city, state, trust_score`)
            .eq('is_public', true)
        ]);

        if (poiErr) throw poiErr;
        if (profErr) throw profErr;

        const resolvedPois = await Promise.all(
          poiData.map(async p => ({
            id: p.id,
            name: p.trust_badge || p.main_alias || '',
            avatar_url: await resolveAvatarUrl(p.avatar_url),
            city: p.city || '',
            state: p.state || '',
            trust_score: Number(p.trust_score) || 0,
            createdBy: p.created_by
          }))
        );

        const resolvedProfiles = await Promise.all(
          profData.map(async p => ({
            id: p.id,
            name: p.name || '',
            avatar_url: await resolveAvatarUrl(p.avatar_url),
            city: p.city || '',
            state: p.state || '',
            trust_score: Number(p.trust_score) || 0,
            createdBy: p.user_id
          }))
        );

        setPois(resolvedPois);
        setProfiles(resolvedProfiles);
      } catch (err) {
        console.error('Error loading data:', err);
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
  const filteredProfiles = profiles.filter(p =>
    p.name.toLowerCase().includes(term) ||
    (`${p.city}, ${p.state}`).toLowerCase().includes(term)
  );

  if (loading || isLoading) return <div className="spinner">Loading…</div>;
  if (error) return <p className="empty-state">{error}</p>;

  const Hearts = ({ score }) => (
    <div className="trust-score">
      {'❤️'.repeat(Math.max(0, Math.min(5, Math.round(score))))}
      <span className="score-number">{score.toFixed(1)}</span>
    </div>
  );

  return (
    <div className="container">
      <div className="controls" style={{ marginBottom: '1rem' }}>
        <label>
          <input
            type="checkbox"
            checked={showProfiles}
            onChange={() => setShowProfiles(prev => !prev)}
          />{' '}
          {showProfiles ? 'Show Persons of Interest' : 'Show Public Profiles'}
        </label>
        <input
          className="search-input"
          type="text"
          placeholder="Search by name, city, or state…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginLeft: '1rem' }}
        />
      </div>

      {!showProfiles ? (
        <>
          <h2>Persons of Interest</h2>
          {filteredPois.length === 0 ? (
            <p className="empty-state">No persons of interest found.</p>
          ) : (
            <div className="profiles-grid">
              {filteredPois.map(p => (
                <Link key={p.id} to={`/persons/${p.id}`} className="profile-card">
                  <img src={p.avatar_url} alt={p.name || 'POI'} className="profile-avatar" />
                  <h3>
                    {p.name || 'Unnamed'}
                    {p.createdBy === userId && <span className="badge">This is you</span>}
                  </h3>
                  <Hearts score={p.trust_score} />
                  <small className="region">{p.city || '—'}, {p.state}</small>
                </Link>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <h2>Public User Profiles</h2>
          {filteredProfiles.length === 0 ? (
            <p className="empty-state">No public profiles found.</p>
          ) : (
            <div className="profiles-grid">
              {filteredProfiles.map(p => (
                <Link key={p.id} to={`/profiles/${p.id}`} className="profile-card">
                  <img src={p.avatar_url} alt={p.name || 'User'} className="profile-avatar" />
                  <h3>
                    {p.name || 'Unnamed'}
                    {p.createdBy === userId && <span className="badge">This is you</span>}
                  </h3>
                  <Hearts score={p.trust_score} />
                  <small className="region">{p.city || '—'}, {p.state}</small>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
