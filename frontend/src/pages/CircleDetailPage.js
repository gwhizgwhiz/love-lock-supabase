// src/pages/CircleDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link }           from 'react-router-dom';
import { CircleService }              from '../lib/circles';
import supabase                       from '../supabaseClient';

export default function CircleDetailPage() {
  const { slug } = useParams();

  // --- Circle + creator state ---
  const [circle, setCircle]               = useState(null);
  const [loadingCircle, setLoadingCircle] = useState(true);
  const [errorCircle, setErrorCircle]     = useState(null);

  useEffect(() => {
    async function loadCircle() {
      setLoadingCircle(true);
      const { data, error } = await CircleService.getCircleBySlug(slug);
      if (error) {
        setErrorCircle(error);
        setCircle(null);
      } else {
        const row = data[0] || null;
      if (row?.creator_avatar_url) {
        // Replace 'avatars' with your actual bucket name if different
        const { publicURL } = supabase
          .storage
          .from('avatars')
          .getPublicUrl(row.creator_avatar_url);
        row.creator_avatar_url = publicURL;
      }
        setCircle(row);
        setErrorCircle(null);
      }
      setLoadingCircle(false);
    }
    loadCircle();
  }, [slug]);

  // --- Members list state (by slug) ---
  const [members, setMembers]             = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [errorMembers, setErrorMembers]     = useState(null);

  useEffect(() => {
    async function loadMembers() {
      setLoadingMembers(true);
      const { data, error } = await CircleService.getCircleMembersBySlug(slug);
      if (error) {
        setErrorMembers(error);
        setMembers([]);
      } else {
  // Convert each member.avatar_url path to a public URL
      const withUrls = data.map(m => {
          if (m.avatar_url) {
            const { publicURL } = supabase
              .storage
              .from('avatars')
              .getPublicUrl(m.avatar_url);
            return { ...m, avatar_url: publicURL };
          }
          return m;
        });
        setErrorMembers(null);
        setMembers(withUrls);
      }
      setLoadingMembers(false);
    }
    loadMembers();
  }, [slug]);

  // --- Authenticated user status ---
  const [alreadyMember,    setAlreadyMember]    = useState(false);
  const [alreadyRequested, setAlreadyRequested] = useState(false);

  useEffect(() => {
    async function checkStatus() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) return;

      setAlreadyMember(
        members.some(m => m.user_id === user.id && m.status === 'approved')
      );
      setAlreadyRequested(
        members.some(m => m.user_id === user.id && m.status === 'pending')
      );
    }
    if (!loadingMembers && !errorMembers) {
      checkStatus();
    }
  }, [members, loadingMembers, errorMembers]);

  // --- Join flows ---
  const handleJoin = async () => {
    const { error } = await CircleService.joinCircle(circle.id);
    if (error) alert('Error joining circle: ' + error.message);
    else {
      // refresh members
      const { data } = await CircleService.getCircleMembersBySlug(slug);
      setMembers(data);
    }
  };

  const [isRequesting, setIsRequesting] = useState(false);
  const [requestError, setRequestError] = useState(null);
  const handleRequestJoin = async () => {
    setIsRequesting(true);
    setRequestError(null);
    const { error } = await CircleService.requestJoin(circle.id);
    setIsRequesting(false);

    if (error) {
      setRequestError(error);
    } else {
      setAlreadyRequested(true);
    }
  };

  // --- Render loading / error ---  
  if (loadingCircle) return <p>Loading circle…</p>;
  if (errorCircle)  return <p>Error: {errorCircle.message}</p>;
  if (!circle)      return <p>Circle not found.</p>;

  return (
    <div>
      <h1>
        <img
          src={circle.creator_avatar_url}  
          alt={circle.creator_name}
          width={32} height={32}
          style={{ borderRadius:'50%', marginRight:8 }}
        />
        {circle.icon} {circle.name}
      </h1>
      <p>
        Location: {circle.city}, {circle.state} ({circle.zip})<br/>
        Type: {circle.type}<br/>
        Created by: <strong>{circle.creator_name}</strong>
      </p>

      {/* Open‑join Flow */}
      {circle.join_policy === 'open' && !alreadyMember && (
        <button onClick={handleJoin}>Join Circle</button>
      )}
      {circle.join_policy === 'open' && alreadyMember && (
        <p>You’re a member of this circle.</p>
      )}

      {/* Request‑to‑Join Flow */}
      {circle.join_policy === 'request' && !alreadyMember && (
        <>
          {!alreadyRequested && (
            <button onClick={handleRequestJoin} disabled={isRequesting}>
              {isRequesting ? 'Requesting…' : 'Request to Join'}
            </button>
          )}
          {alreadyRequested && (
            <p>
              {alreadyMember
                ? "You’re a member of this circle."
                : 'Your join request is pending.'}
            </p>
          )}
          {requestError && (
            <p style={{ color: 'red' }}>Error: {requestError.message}</p>
          )}
        </>
      )}

      {/* Members List */}
      <h2>Members</h2>
      {loadingMembers && <p>Loading members…</p>}
      {errorMembers && <p>Error: {errorMembers.message}</p>}
      {!loadingMembers && !errorMembers && (
        <ul className="member-list">
          {members.map(m => (
            <li key={m.member_id} style={{ marginBottom:'0.5rem' }}>
              <img
                src={m.avatar_url}
                alt={m.member_name}
                width={24} height={24}
                style={{ borderRadius:'50%', marginRight:6 }}
              />
              <strong>{m.member_name}</strong> — <em>{m.role}</em>
            </li>
          ))}
        </ul>
      )}

      <Link to="/my-circles">← Back to My Circles</Link>
    </div>
  );
}
