// src/pages/ProfileDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link }              from 'react-router-dom';
import supabase                          from '../supabaseClient';
import useAuth                           from '../hooks/useAuth';
import defaultAvatar                     from '../assets/default-avatar.png';
import '../App.css';

export default function ProfileDetail() {
  const { slug } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile]          = useState(null);
  const [avatarUrl, setAvatarUrl]      = useState(defaultAvatar);
  const [interactions, setInteractions]= useState([]);
  const [breakdown, setBreakdown]      = useState([]);
  const [createdBy, setCreatedBy]      = useState(null);
  const [loading, setLoading]          = useState(true);
  const [notFound, setNotFound]        = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // 1) fetch the shared public view
      const { data: p, error: pErr } = await supabase
        .from('public_profile_enriched_view')
        .select(`
          poi_id,
          slug,
          main_alias,
          known_region,
          avatar_url,
          trust_score,
          trust_badge,
          is_shareable,
          total_interactions,
          positive_pct,
          last_interaction
        `)
        .eq('slug', slug)
        .single()

      if (pErr || !p) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // 2) fetch avatar (or fall back)
      if (p.avatar_url) {
        const { data: { publicUrl }, error: urlErr } = supabase
          .storage
          .from('avatars')
          .getPublicUrl(p.avatar_url);
        if (!urlErr && publicUrl) setAvatarUrl(publicUrl);
      }

      // 3) recent interactions
      const { data: ints = [] } = await supabase
        .from('public_interactions_view')
        .select('id, interaction_type, occurred_at, outcome_rating')
        .eq('person_id', p.poi_id)
        .order('occurred_at', { ascending: false })
        .limit(10);

      // 4) who owns this profile?
      const { data: poiRow, error: poiErr } = await supabase
        .from('person_of_interest')
        .select('created_by')
        .eq('id', p.poi_id)
        .single();
      if (!poiErr && poiRow) setCreatedBy(poiRow.created_by);

      // 5) breakdown RPC
      let bd = [];
      try {
        const { data: rpcData = [] } = await supabase
          .rpc('get_criteria_breakdown', { _person_id: p.poi_id });
        bd = rpcData;
      } catch { bd = []; }

      setProfile(p);
      setInteractions(ints);
      setBreakdown(bd);
      setLoading(false);
    }

    load();
  }, [slug]);

  if (loading || authLoading) return <div className="spinner">Loading…</div>;
  if (notFound)              return <p className="empty-state">Profile not found.</p>;

  const isOwner = user?.id === createdBy;
  const hearts  = Math.max(0, Math.round(profile.trust_score || 0));

  return (
    <div className="detail-container">
      <section
        className="hero"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#FCEAEA',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          marginBottom: '2rem'
        }}
      >
        {/* Left: avatar + info */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={avatarUrl}
            alt={profile.main_alias}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              objectFit: 'cover',
              marginRight: '1rem'
            }}
            className="hero-avatar"
          />
          <div className="hero-info">
            <h1>{profile.main_alias}</h1>
            <div className="trust-badge">
              {'❤️'.repeat(hearts)}
              <span className="score-number">
                {(profile.trust_score || 0).toFixed(1)}
              </span>
            </div>
            <div className="hero-stats">
              <span>{profile.total_interactions} interactions</span>
              <span>{Math.round(profile.positive_pct)}% positive</span>
              <span>
                Last: {new Date(profile.last_interaction).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Right: edit button */}
        {isOwner && (
          <div>
            <Link to="/profile/edit">
              <button className="btn" style={{ whiteSpace: 'nowrap' }}>
                Edit Profile
              </button>
            </Link>
          </div>
        )}
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
