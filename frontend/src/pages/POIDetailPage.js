// src/pages/POIDetailPage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useCurrentUser from '../hooks/useCurrentUser';
import supabase from '../supabaseClient';
import resolveAvatarUrl from '../lib/resolveAvatarUrl';
import TrustDisplay from '../components/TrustDisplay';
import TagSelector from '../components/TagSelector';
import '../App.css';

export default function POIDetailPage() {
  const { userId, loading: userLoading } = useCurrentUser();
  const { slug } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [userTag, setUserTag] = useState(null);

  useEffect(() => {
  if (!profile?.id || !userId) return;

  const fetchUserTag = async () => {
    const { data, error } = await supabase
      .from('poi_tag_assignments')
      .select('tag_id, tags(name)')
      .eq('user_id', userId)
      .eq('poi_id', profile.id)
      .maybeSingle();

    if (error) {
      console.warn('No tag assigned or fetch error:', error);
    } else if (data) {
      setUserTag(data.tags?.name || null);
    }
  };

  fetchUserTag();
}, [profile?.id, userId]);
  
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

  useEffect(() => {
    const fetchInteractions = async () => {
      if (!profile?.id) return;

      const { data, error } = await supabase
        .from('interactions')
        .select('id, date_of_experience, what_went_right, what_went_wrong, profile_match_vote')
        .eq('poi_id', profile.id)
        .order('date_of_experience', { ascending: false });

      if (!error && data) {
        setInteractions(data);
      } else {
        console.error('Error fetching interactions:', error);
      }
    };

    fetchInteractions();
  }, [profile?.id]);

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
            <TagSelector poiId={profile?.id} userId={userId} />
            {userTag && (
              <p className="tag-assigned-label">
                You tagged this person as: <strong>{userTag}</strong>
              </p>
            )}
          </div>

          <button
            className="btn-outline btn-small"
            onClick={() => navigate(`/interactions?slug=${profile.slug}`)}
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

      {interactions.length > 0 && (
        <div className="dashboard-section">
          <h3 className="section-header">Recent Interactions</h3>
          <ul className="interaction-list">
            {interactions.map((i) => (
              <li key={i.id} className="interaction-card">
                <p><strong>Date:</strong> {new Date(i.date_of_experience).toLocaleDateString()}</p>
                {i.profile_match_vote && <p><strong>Match Vote:</strong> {i.profile_match_vote}</p>}
                {i.what_went_right && <p><strong>Went Right:</strong> {i.what_went_right}</p>}
                {i.what_went_wrong && <p><strong>Went Wrong:</strong> {i.what_went_wrong}</p>}
                <p>
                  <Link to={`/interactions/view/${i.id}`} className="interaction-link">
                    View full report →
                  </Link>
                </p>
              </li>
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
