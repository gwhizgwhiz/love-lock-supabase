import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { CircleService } from '../lib/circles';
import supabase from '../supabaseClient';
import defaultAvatar from '../assets/default-avatar.png';
import '../App.css';

// Simple email regex for validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CircleDetailPage() {
  const { slug } = useParams();

  // Core state
  const [circle, setCircle] = useState(null);
  const [members, setMembers] = useState([]);
  const [loadingCircle, setLoadingCircle] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [errorCircle, setErrorCircle] = useState(null);
  const [errorMembers, setErrorMembers] = useState(null);

  // Auth state
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [isModerator, setIsModerator] = useState(false);

  // Invite/autocomplete state
  const [inviteInput, setInviteInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const suggRef = useRef();

  // Toast state
  const [toast, setToast] = useState({ message: '', type: '' });
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  // Load circle details
  useEffect(() => {
    async function loadCircle() {
      setLoadingCircle(true);
      try {
        const { data, error } = await CircleService.getCircleBySlug(slug);
        if (error) throw error;
        const row = (data && data[0]) || null;
        if (row) {
          let avatar = defaultAvatar;
          if (row.creator_photo_reference_url) {
            const { data: urlData, error: urlErr } = supabase
              .storage.from('avatars')
              .getPublicUrl(row.creator_photo_reference_url);
            if (!urlErr && urlData?.publicUrl) avatar = urlData.publicUrl;
          }
          row.creator_avatar_url = avatar;
        }
        setCircle(row);
      } catch (err) {
        setErrorCircle(err);
        showToast('Failed to load circle.', 'error');
      } finally {
        setLoadingCircle(false);
      }
    }
    loadCircle();
  }, [slug]);

  // Load members list
  useEffect(() => {
    async function loadMembers() {
      setLoadingMembers(true);
      try {
        const { data, error } = await CircleService.getCircleMembersBySlug(slug);
        if (error) throw error;
        const enriched = (data || []).map(m => {
          let avatar = defaultAvatar;
          if (m.photo_reference_url) {
            const { data: urlData, error: urlErr } = supabase
              .storage.from('avatars')
              .getPublicUrl(m.photo_reference_url);
            if (!urlErr && urlData?.publicUrl) avatar = urlData.publicUrl;
          }
          return { ...m, avatar_url: avatar };
        });
        setMembers(enriched);
      } catch (err) {
        setErrorMembers(err);
        showToast('Failed to load members.', 'error');
      } finally {
        setLoadingMembers(false);
      }
    }
    loadMembers();
  }, [slug]);

  // Get authenticated user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
  }, []);

  // Determine membership/moderator status
  useEffect(() => {
    const member = members.find(
      m => m.user_id === currentUserId && m.status === 'approved'
    );
    setIsMember(!!member);
    setIsModerator(member?.role === 'moderator');
  }, [members, currentUserId]);

  // Autocomplete suggestions for internal users
  useEffect(() => {
    async function fetchSuggestions() {
      if (!inviteInput || emailRegex.test(inviteInput)) {
        setSuggestions([]);
        setSelectedUser(null);
        return;
      }
      const q = inviteInput.toLowerCase();
      const { data, error } = await supabase
        .from('person_of_interest')
        .select('created_by,slug,main_alias')
        .or(`slug.ilike.%${q}%,main_alias.ilike.%${q}%`)
        .limit(5);
      if (!error && data) {
        setSuggestions(
          data.map(u => ({
            user_id: u.created_by,
            slug: u.slug,
            main_alias: u.main_alias,
          }))
        );
      }
    }
    fetchSuggestions();
  }, [inviteInput]);

  // Click outside suggestions to dismiss
  useEffect(() => {
    function handleClick(e) {
      if (suggRef.current && !suggRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Invite handler: internal or external
  const handleInvite = async () => {
    const inputTrim = inviteInput.trim();
    if (!inputTrim) return;

    if (selectedUser) {
      // Internal invite
      const { error } = await CircleService.manageMember({
        circleId: circle.id,
        userId: selectedUser,
        status: 'approved',
        role: 'member',
      });
      if (error) showToast('Add member failed: ' + error.message, 'error');
      else showToast('Member added');
    } else if (emailRegex.test(inputTrim)) {
      // External email invite
      const { error } = await CircleService.inviteToCircle(circle.id, inputTrim);
      if (error) showToast('Invite failed: ' + error.message, 'error');
      else showToast('Invitation sent');
    } else {
      showToast('No matching user found.', 'error');
    }

    // Refresh members and clear
    const { data: newMembers } = await CircleService.getCircleMembersBySlug(slug);
    setMembers(newMembers || []);
    setInviteInput('');
    setSuggestions([]);
    setSelectedUser(null);
  };

  // Remove (kick) member
  const handleRemove = async userId => {
    const { error } = await CircleService.manageMember({
      circleId: circle.id,
      userId,
      status: 'removed',
      role: null,
    });
    if (error) showToast('Remove failed: ' + error.message, 'error');
    else {
      showToast('Member removed');
      const { data: newMembers } = await CircleService.getCircleMembersBySlug(slug);
      setMembers(newMembers || []);
    }
  };

  if (loadingCircle) return <div>Loading circle…</div>;
  if (errorCircle) return <div>Error: {errorCircle.message}</div>;
  if (!circle) return <div>Circle not found.</div>;

  return (
    <div className="container circle-detail">
      {/* Toast banner */}
      {toast.message && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      {/* Header: title + invite control */}
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
            <button
              className="btn btn-small circle-invite-button"
              onClick={handleInvite}
            >
              ✉️ Invite
            </button>
            {suggestions.length > 0 && (
              <ul className="invite-suggestions">
                {suggestions.map(u => (
                  <li
                    key={u.user_id}
                    className="invite-suggestion-item"
                    onClick={() => {
                      setInviteInput(u.main_alias);
                      setSelectedUser(u.user_id);
                      setSuggestions([]);
                    }}
                  >
                    {u.main_alias}
                    {u.slug !== u.main_alias && ` (${u.slug})`}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Circle Info & Creator */}
      <p className="circle-info">
        Location: {circle.city}, {circle.state} ({circle.zip})<br />
        Type: {circle.type}
      </p>
      <div className="circle-creator">
        <img
          className="circle-creator-avatar"
          src={circle.creator_avatar_url}
          alt={circle.creator_name}
        />
        <span>Created by <strong>{circle.creator_name}</strong></span>
      </div>

      {/* Members List */}
      <h2>Members</h2>
      {loadingMembers && <p>Loading members…</p>}
      {errorMembers && <p>Error: {errorMembers.message}</p>}
      {!loadingMembers && !errorMembers && (
        <ul className="member-list">
          {members.filter(m => m.status === 'approved').map(m => (
            <li key={m.member_id} className="member-item">
              <img
                className="member-avatar"
                src={m.avatar_url}
                alt={m.main_alias}
              />
              <strong>{m.main_alias}</strong>
              {isModerator && m.user_id !== currentUserId && (
                <button
                  className="btn btn-small btn-outline member-remove-button"
                  onClick={() => handleRemove(m.user_id)}
                >
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
