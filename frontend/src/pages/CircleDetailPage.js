// src/pages/CircleDetailPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { CircleService } from '../lib/circles';
import supabase from '../supabaseClient';
import useCurrentUser from '../hooks/useCurrentUser';
import resolveAvatarUrl from '../lib/resolveAvatarUrl';
import defaultAvatar from '../assets/default-avatar.png';
import '../App.css';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CircleDetailPage() {
  const { slug } = useParams();
  const { userId: currentUserId, loading: userLoading } = useCurrentUser();
  const [circle, setCircle] = useState(null);
  const [members, setMembers] = useState([]);
  const [loadingCircle, setLoadingCircle] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '' });

  const [inviteInput, setInviteInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const suggRef = useRef();

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  useEffect(() => {
    (async () => {
      setLoadingCircle(true);
      try {
        const { data, error } = await CircleService.getCircleBySlug(slug);
        if (error) throw error;
        const row = data?.[0] || null;
        if (row && row.creator_avatar_url) {
          row.creator_avatar_url = await resolveAvatarUrl(row.creator_avatar_url);
        }
        setCircle(row);
      } catch {
        showToast('Failed to load circle.', 'error');
      } finally {
        setLoadingCircle(false);
      }
    })();
  }, [slug]);

  useEffect(() => {
    (async () => {
      setLoadingMembers(true);
      try {
        const { data, error } = await CircleService.getCircleMembersBySlug(slug);
        if (error) throw error;
        const enriched = await Promise.all((data || []).map(async m => ({
          ...m,
          avatar_url: await resolveAvatarUrl(m.avatar_url),
        })));
        setMembers(enriched);
      } catch {
        showToast('Failed to load members.', 'error');
      } finally {
        setLoadingMembers(false);
      }
    })();
  }, [slug]);

  const isMember = !userLoading && members.some(m => m.user_id === currentUserId && m.status === 'approved');
  const isModerator = !userLoading && members.some(m => m.user_id === currentUserId && m.role === 'moderator');

  useEffect(() => {
    if (!inviteInput || emailRegex.test(inviteInput)) {
      setSuggestions([]);
      setSelectedUser(null);
      return;
    }
    const fetchSuggestions = async () => {
      const { data, error } = await supabase
        .from('person_of_interest')
        .select('created_by, slug, main_alias')
        .or(`slug.ilike.%${inviteInput.toLowerCase()}%,main_alias.ilike.%${inviteInput.toLowerCase()}%`)
        .limit(5);
      if (!error && data) {
        setSuggestions(data.map(u => ({
          user_id: u.created_by,
          slug: u.slug,
          main_alias: u.main_alias,
        })));
      }
    };
    fetchSuggestions();
  }, [inviteInput]);

  useEffect(() => {
    const handleClick = e => {
      if (suggRef.current && !suggRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleInvite = async () => {
    const input = inviteInput.trim();
    if (!input) return;

    try {
      if (selectedUser) {
        await CircleService.manageMember({
          circleId: circle.id,
          userId: selectedUser,
          status: 'approved',
          role: 'member',
        });
        showToast('Member added');
      } else if (emailRegex.test(input)) {
        await CircleService.inviteToCircle(circle.id, input);
        showToast('Invitation sent');
      } else {
        showToast('No matching user found.', 'error');
      }
    } catch (err) {
      showToast(`Invite failed: ${err.message}`, 'error');
    }

    const { data: newMembers } = await CircleService.getCircleMembersBySlug(slug);
    setMembers(newMembers || []);
    setInviteInput('');
    setSuggestions([]);
    setSelectedUser(null);
  };

  const handleRemove = async userId => {
    try {
      await CircleService.manageMember({
        circleId: circle.id,
        userId,
        status: 'removed',
        role: null,
      });
      showToast('Member removed');
      const { data: newMembers } = await CircleService.getCircleMembersBySlug(slug);
      setMembers(newMembers || []);
    } catch (err) {
      showToast(`Remove failed: ${err.message}`, 'error');
    }
  };

  if (loadingCircle) return <div>Loading circle…</div>;
  if (!circle) return <div>Circle not found.</div>;

  return (
    <div className="container circle-detail">
      {toast.message && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

      <div className="circle-header">
        <h1 className="circle-title">
          <span className="circle-icon">{circle.icon}</span>
          {circle.name}
        </h1>
        {isMember && (
          <div className="invite-control" ref={suggRef}>
            <input
              className="invite-input"
              type="text"
              placeholder="Email or username"
              value={inviteInput}
              onChange={e => {
                setInviteInput(e.target.value);
                setSelectedUser(null);
                setSuggestions([]);
              }}
            />
            <button className="btn btn-small circle-invite-button" onClick={handleInvite}>✉️ Invite</button>
            {suggestions.length > 0 && (
              <ul className="invite-suggestions">
                {suggestions.map(u => (
                  <li key={u.user_id} className="invite-suggestion-item" onClick={() => {
                    setInviteInput(u.main_alias);
                    setSelectedUser(u.user_id);
                    setSuggestions([]);
                  }}>
                    {u.main_alias} {u.slug !== u.main_alias && `(${u.slug})`}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <p className="circle-info">
        Location: {circle.city}, {circle.state} ({circle.zipcode})<br />
        Type: {circle.type}
      </p>

      <div className="circle-creator">
        <img className="circle-creator-avatar" src={circle.creator_avatar_url || defaultAvatar} alt={circle.creator_name} />
        <span>Created by <strong>{circle.creator_name}</strong></span>
      </div>

      <h2>Members</h2>
      {loadingMembers ? <p>Loading members…</p> : (
        <ul className="member-list">
          {members.filter(m => m.status === 'approved').map(m => (
            <li key={m.member_id} className="member-item">
              <img className="member-avatar" src={m.avatar_url} alt={m.main_alias} />
              <strong>{m.main_alias}</strong>
              {isModerator && m.user_id !== currentUserId && (
                <button className="btn btn-small btn-outline member-remove-button" onClick={() => handleRemove(m.user_id)}>
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
