// src/pages/DashboardPage.js
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import useCurrentUser from '../hooks/useCurrentUser';
import defaultAvatar from '../assets/default-avatar.png';
import resolveAvatarUrl from '../lib/resolveAvatarUrl';
import '../App.css';

export default function DashboardPage() {
  const { userId, loading } = useCurrentUser();
  const [profile, setProfile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatar);
  const [circles, setCircles] = useState([]);
  const [inboxCount, setInboxCount] = useState(0);
  const [interactions, setInteractions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !userId) return;

    const loadDashboard = async () => {
      setIsLoading(true);
      try {
        // Profile

        // Profile
        const { data: prof, error: profErr } = await supabase
          .from('profiles')
          .select('id, user_id, name, avatar_url, trust_score, is_verified, gender_identity, dating_preference, city, state, zip, is_public')
          .eq('user_id', userId)
          .single();

        if (profErr) throw profErr;

        setProfile(prof);
        setAvatarUrl(await resolveAvatarUrl(prof.avatar_url) || defaultAvatar);


        // Circles
        const { data: circ, error: circErr } = await supabase
          .from('circle_members')
          .select('circle_id, role, circles(name, created_by)')
          .eq('user_id', userId);
        if (circErr) throw circErr;
        setCircles(circ);

        // Interactions
        const { data: inter, error: interErr } = await supabase
          .from('interactions')
          .select('id, date_of_experience, what_went_right, what_went_wrong, profile_match_vote, person_of_interest(main_alias)')
          .eq('reporter_id', userId)
          .order('created_at', { ascending: false });
        if (interErr) throw interErr;
        setInteractions(inter);

        // Inbox placeholder
        setInboxCount(0);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboard();
  }, [loading, userId]);

  if (loading || isLoading) return <div className="spinner">Loading…</div>;

  return (
    <div className="container">
      <h2>Welcome Back!</h2>
      <section className="profile-summary">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src={avatarUrl} alt="Avatar" className="avatar-menu-avatar" />
          <div>
            <p><strong>Name:</strong> {profile?.name || 'Not set'}</p>
            <p><strong>Location:</strong> {profile?.city || ''}, {profile?.state || ''}</p>
            <p><strong>Gender:</strong> {profile?.gender_identity || 'Not set'}</p>
            <p><strong>Preferences:</strong> {profile?.dating_preference || 'Not set'}</p>
          </div>
        </div>
        {!profile?.id && <button className="btn-small" onClick={() => navigate('/profile/edit')}>Set Up Your Profile</button>}
      </section>
      <section className="circles-summary" style={{ marginTop: '2rem' }}>
        <h3>Your Circles</h3>
        {circles.length === 0 ? (
          <p>You haven’t joined any circles yet. <button className="btn-small" onClick={() => navigate('/my-circles')}>Explore Circles</button></p>
        ) : (
          <ul className="member-list">
            {circles.map(c => (
              <li key={c.circle_id} className="member-item">
                <span>{c.circles.name}</span>
                <span className="badge">{c.role === 'moderator' ? 'Moderator' : c.circles.created_by === userId ? 'Creator' : 'Member'}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="inbox-summary" style={{ marginTop: '2rem' }}>
        <h3>Inbox</h3>
        <p>You have <strong>{inboxCount}</strong> messages. <button className="btn-small" onClick={() => navigate('/inbox')}>Go to Inbox</button></p>
      </section>
      <section className="interactions-summary" style={{ marginTop: '2rem' }}>
        <h3>Your Logged Interactions</h3>
        {interactions.length === 0 ? (
          <p>No interactions logged yet. <button className="btn-small" onClick={() => navigate('/rate-date')}>Log One</button></p>
        ) : (
          <ul className="timeline">
            {interactions.map(i => (
              <li key={i.id}>
                <span><strong>{i.person_of_interest?.main_alias || 'Unknown'}</strong> ({i.profile_match_vote || 'No vote'})</span>
                <span>{i.date_of_experience || 'No date'}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
