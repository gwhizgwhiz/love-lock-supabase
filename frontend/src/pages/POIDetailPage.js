// src/pages/ProfileDetailPage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useCurrentUser from '../hooks/useCurrentUser';
import supabase from '../supabaseClient';
import resolveAvatarUrl from '../lib/resolveAvatarUrl';
import TrustDisplay from '../components/TrustDisplay';
import '../App.css';

export default function ProfileDetailPage() {
  const { loading: userLoading } = useCurrentUser();
  const { slug } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!slug) {
        setError('Missing profile slug.');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('public_profile_stats_view')
          .select('*')
          .eq('slug', slug)
          .single();

        if (fetchError || !data) {
          setError('Profile not found or is private.');
        } else {
          const avatar = await resolveAvatarUrl(data.avatar_url);
          setProfile({ ...data, avatar_url: avatar });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('An error occurred while loading the profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [slug]);

  if (loading || userLoading) {
    return (
      <div className="container">
        <h2>Loading Profile...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h2>Error</h2>
        <p className="error">{error}</p>
        <button className="btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="hero">
        <img
          src={profile.avatar_url}
          alt={profile.main_alias || 'User'}
          className="hero-avatar"
        />
        <div className="hero-info">
          <h1>{profile.main_alias}</h1>
          {(profile.city || profile.state) && <p>📍 {profile.city}, {profile.state}</p>}
          {profile.gender_identity && <p>Gender: {profile.gender_identity}</p>}
          {profile.dating_preference && <p>Looking for: {profile.dating_preference}</p>}

          <div className="trust-container">
            <TrustDisplay score={profile.trust_score} />
          </div>

          <button
            className="btn-outline btn-small"
            onClick={() => navigate(`/interactions?poiId=${profile.poi_id}`)}
          >
            Log an Interaction
          </button>
        </div>
      </div>

      <div className="dashboard-section">
        <h3 className="section-header">Trust Summary</h3>
        <p>Total Interactions: {profile.total_interactions || 0}</p>
        <p>👍 Positive: {profile.positive_interactions || 0}</p>
        <p>👎 Negative: {profile.negative_interactions || 0}</p>
        <p>😐 Neutral: {profile.neutral_interactions || 0}</p>
      </div>

      {profile.unique_inaccuracy_tags?.length > 0 && (
        <div className="dashboard-section">
          <h3 className="section-header">Reported Profile Inaccuracies</h3>
          <ul>
            {profile.unique_inaccuracy_tags.map((tag, idx) => (
              <li key={idx}>⚠️ {tag}</li>
            ))}
          </ul>
        </div>
      )}

      {profile.platform_distribution && (
        <div className="dashboard-section">
          <h3 className="section-header">Platform Distribution</h3>
          <ul>
            {Object.entries(profile.platform_distribution).map(([platform, count]) => (
              <li key={platform}>{platform}: {count}</li>
            ))}
          </ul>
        </div>
      )}

      {profile.location_distribution && (
        <div className="dashboard-section">
          <h3 className="section-header">Location Distribution</h3>
          <ul>
            {Object.entries(profile.location_distribution).map(([location, count]) => (
              <li key={location}>{location}: {count}</li>
            ))}
          </ul>
        </div>
      )}

      <button className="btn" onClick={() => navigate(-1)}>
        ← Back
      </button>
    </div>
  );
}
