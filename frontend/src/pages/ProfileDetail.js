import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useCurrentUser from '../hooks/useCurrentUser'; // Consistent user hook     
import supabase from '../supabaseClient';
import '../App.css'; // Ensure CSS is applied

export default function ProfileDetailPage() {
  const { userId } = useCurrentUser();
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
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          location,
          gender_identity,
          dating_preference,
          avatar_url,
          is_public
        `)
        .eq('id', id)
        .single();

      if (error || !data) {
        setError('Profile not found or is private.');
      } else {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [id]);

  if (loading) {
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
      </div>
    );
  }

  return (
    <div className="container">
      <div className="hero">
        <img
          src={profile.avatar_url || '/default-avatar.png'}
          alt={profile.username || 'User'}
          className="hero-avatar"
        />
        <div className="hero-info">
          <h1>{profile.username}</h1>
          {profile.location && <p>📍 {profile.location}</p>}
          {profile.gender_identity && <p>Gender: {profile.gender_identity}</p>}
          {profile.dating_preference && <p>Looking for: {profile.dating_preference}</p>}
          <p>Status: {profile.is_public ? 'Public' : 'Private'}</p>
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
