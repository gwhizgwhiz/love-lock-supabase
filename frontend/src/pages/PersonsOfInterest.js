// frontend/src/pages/PersonsOfInterestPage.js
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import supabase from '../supabaseClient';
import useCurrentUser from '../hooks/useCurrentUser';
import resolveAvatarUrl from '../lib/resolveAvatarUrl';
import TrustDisplay from '../components/TrustDisplay'; 
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
          .select('id, slug, trust_badge, main_alias, avatar_url, city, state, zipcode, trust_score, created_by, is_public')
          .eq('is_public', true)

        if (error) throw error;

        const resolvedPois = await Promise.all(
          (data || []).map(async p => ({
            id: p.id,
            slug: p.slug, 
            name: p.trust_badge || p.main_alias || '',
            avatar_url: await resolveAvatarUrl(p.avatar_url),
            city: p.city || '',
            state: p.state || '',
            zipcode: p.zipcode || '',
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

  return (
    <div className="container">
      <h2>Persons of Interest</h2>

      <div className="controls">
        <input
          className="search-input"
          type="text"
          placeholder="Search by name, city, state, or zipcode…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filteredPois.length === 0 ? (
        <p className="empty-state">No persons of interest found.</p>
      ) : (
        <div className="poi-grid">
  {filteredPois.map(p => (
    <Link key={p.id} to={`/poi/${p.slug}`} className="poi-card">
    <div className="poi-badge-container">
        {p.createdBy === userId && <span className="badge">Created by You</span>}
    </div>
    <img src={p.avatar_url} alt={p.name || 'POI'} className="poi-avatar" />
    <div className="poi-name">{p.name || 'Unnamed'}</div>
    <div className="poi-trust"><TrustDisplay score={p.trust_score} />
    </div>
    <div className="poi-location">{p.city || '—'}</div>
    </Link>
    ))}
    </div>
      )}
    </div>
  );
}
