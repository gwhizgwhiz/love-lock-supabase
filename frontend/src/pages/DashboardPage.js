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
  // const [circles, setCircles] = useState([]);
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
        const { data: prof, error: profErr } = await supabase
          .from('profiles')
          .select('id, user_id, name, avatar_url, is_verified, gender_identity, age, dating_preference, city, state, zipcode, is_public')
          .eq('user_id', userId)
          .single();

        if (profErr) throw profErr;

        setProfile(prof);
        setAvatarUrl(await resolveAvatarUrl(prof.avatar_url) || defaultAvatar);


      /*   // Circles
        const { data: circ, error: circErr } = await supabase
          .from('circles')
          .select('*')
          .eq('created_by', userId);
        if (circErr) throw circErr;
        console.log('Fetched circles:', circ);
        setCircles(circ); */

        // Interactions
        const { data: inter, error: interErr } = await supabase
          .from('interactions')
          .select('id, date_of_experience, what_went_right, what_went_wrong, profile_match_vote, person_of_interest(main_alias)')
          .eq('reporter_id', userId)
          .order('created_at', { ascending: false });
        if (interErr) throw interErr;
        setInteractions(inter);

        // Fetch inbox count (real count of unread messages)
        const { count, error: countErr } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', userId)
          .eq('is_read', false);
        if (countErr) throw countErr;
        setInboxCount(count || 0);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboard();
  }, [loading, userId]);

  if (loading || isLoading) {
  return (
    <div className="loading-container">
      <div className="loading-logo" />
    </div>
  );
}

  return (
    <div className="container dashboard-container">
  <h2 className="dashboard-heading">Welcome Back!</h2>

  <section className="dashboard-section profile-summary">
    <div className="profile-header">
      <img src={avatarUrl} alt="Avatar" className="avatar-large" />
      <div className="profile-info">
        <h3>{profile?.name || 'Not set'}</h3>
        <p>{profile?.city || ''}, {profile?.state || ''}</p>
        <p>{profile?.gender_identity || 'Not set'}, {profile?.age || 'Not set'}</p>
      </div>
    </div>
    {!profile?.id && <button className="btn btn-small btn-outline" onClick={() => navigate('/profile/edit')}>Set Up Your Profile</button>}
  </section>

  <section className="dashboard-section">
    <div className="section-header">
      <h3>Inbox</h3>
      <button className="btn btn-small btn-outline" onClick={() => navigate('/inbox')}>Go to Inbox</button>
    </div>
    <p>You have <strong>{inboxCount}</strong> unread messages.</p>
  </section>

  {/* <section className="dashboard-section">
    <div className="section-header">
      <h3>Your Circles</h3>
      <button className="btn btn-small btn-outline" onClick={() => navigate('/my-circles')}>Manage Circles</button>
    </div>
    {circles.length === 0 ? (
      <p>You haven’t created any circles yet.</p>
    ) : (
      <div className="circle-grid">
        {circles.map(c => (
          <div key={c.id} className="circle-item" onClick={() => navigate(`/circles/${c.slug}`)}>
            <span className="circle-icon">{c.icon || '💬'}</span>
            <div className="circle-name">{c.name}</div>
          </div>
        ))}
      </div>
    )}
  </section> */}

  <section className="dashboard-section">
    <div className="section-header">
      <h3>Your Logged Interactions</h3>
      <button className="btn btn-small btn-outline" onClick={() => navigate('/interactions')}>Log One</button>
    </div>
    {interactions.length === 0 ? (
      <p>No interactions logged yet.</p>
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
