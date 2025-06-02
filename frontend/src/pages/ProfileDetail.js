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
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      setError('Missing profile ID.');
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
  setLoading(true);
  const { data, error: fetchError } = await supabase
    .from('person_of_interest')
    .select('*')
    .eq('id', id)
    .eq('is_public', true)
    .single(); // 🚀 Get exactly one record or error

  if (fetchError || !data) {
    setError('Profile not found or is private.');
  } else {
    const avatar = await resolveAvatarUrl(data.avatar_url);
    setProfile({ ...data, avatar_url: avatar });
  }
  setLoading(false);
};


    fetchProfile();
  }, [id]);

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
          alt={profile.main_alias || profile.name || 'User'}
          className="hero-avatar"
        />
        <div className="hero-info">
          <h1>{profile.main_alias || profile.name || 'Unnamed'}</h1>
          {(profile.city || profile.state) && <p>📍 {profile.city}, {profile.state}</p>}
          {profile.gender_identity && <p>Gender: {profile.gender_identity}</p>}
          {profile.dating_preference && <p>Looking for: {profile.dating_preference}</p>}
          <div className="trust-container">
            <TrustDisplay score={profile.trust_score} />
          </div>
        </div>
      </div>

      <div className="chart-placeholder">
        Trust Score / Future Stats
      </div>

      <button className="btn" onClick={() => navigate(-1)}>
        ← Back
      </button>
    </div>
  );
}
