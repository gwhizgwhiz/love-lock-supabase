// frontend/src/pages/ProfileDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import '../App.css';

export default function ProfileDetail() {
  const { slug }     = useParams();
  const navigate     = useNavigate();
  const [profile, setProfile] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [breakdown, setBreakdown]       = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // 1) Fetch single row
      const { data: p, error: pErr } = await supabase
        .from('public_profile_view_shared')
        .select(`
          poi_id, slug, main_alias, avatar_url,
          trust_score, total_interactions,
          positive_pct, last_interaction
        `)
        .eq('slug', slug)
        .single();

      if (pErr || !p) {
        navigate('/profiles');
        return;
      }
      setProfile(p);

      // 2) Timeline
      const { data: ints = [] } = await supabase
        .from('public_interactions_view')
        .select('id, interaction_type, occurred_at, outcome_rating')
        .eq('person_id', p.poi_id)
        .order('occurred_at', { ascending: false })
        .limit(10);
      setInteractions(ints);

      // 3) Breakdown
      const { data: bd = [] } = await supabase
        .rpc('get_criteria_breakdown', { _person_id: p.poi_id });
      setBreakdown(bd);

      setLoading(false);
    }
    load();
  }, [slug, navigate]);

  if (loading) return <div className="spinner">Loading…</div>;

  return (
    <div className="detail-container">
      <section className="hero">
        <img
          src={profile.avatar_url || '/default-avatar.png'}
          alt={profile.main_alias}
          className="hero-avatar"
        />
        <div className="hero-info">
          <h1>{profile.main_alias}</h1>
          <div className="trust-badge">
            {'❤️'.repeat(Math.round(profile.trust_score))}
            <span className="score-number">
              {profile.trust_score.toFixed(1)}
            </span>
          </div>
          <div className="hero-stats">
            <span>{profile.total_interactions} interactions</span>
            <span>{Math.round(profile.positive_pct)}% positive</span>
            <span>
              Last:{' '}
              {new Date(profile.last_interaction).toLocaleDateString()}
            </span>
          </div>
        </div>
      </section>

      <section className="breakdown">
        <h2>Criteria Breakdown</h2>
        {breakdown.length > 0 ? (
          <div className="chart-placeholder">Chart goes here</div>
        ) : (
          <p>No breakdown data.</p>
        )}
      </section>

      <section className="timeline">
        <h2>Recent Interactions</h2>
        {interactions.length > 0 ? (
          <ul>
            {interactions.map(i => (
              <li key={i.id} className={`item ${i.outcome_rating}`}>
                <span className="type">
                  {i.interaction_type.replace('_', ' ')}
                </span>
                <span className="time">
                  {new Date(i.occurred_at).toLocaleString()}
                </span>
                <span className="outcome">{i.outcome_rating}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">No interactions logged yet.</p>
        )}
      </section>
    </div>
  );
}
