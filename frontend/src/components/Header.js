// src/components/Header.js
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useCurrentUser from '../hooks/useCurrentUser';
import AvatarMenu from './AvatarMenu';
import logo from '../assets/logo.png';
import RateDateModal from './RateDateModal';
import supabase from '../supabaseClient';
import '../App.css';

export default function Header() {
  const { userId, profile, slug, avatarUrl, loading } = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [showRateModal, setShowRateModal] = useState(false);

  const logoutFunction = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const getButtonClass = (path) => {
    return location.pathname === path ? 'btn-inverse btn-small' : 'btn-outline btn-small';
  };

  return (
    <>
      <header className="header">
        <Link to={userId ? '/dashboard' : '/'} className="header-brand">
          <img src={logo} alt="LoveLock" className="logo" />
          <span className="site-name">LoveLock</span>
        </Link>

        <div className="header-right">
          {!userId ? (
            <>
              <button className="btn btn-small" onClick={() => navigate('/login')}>Log In</button>
              <button className="btn btn-small" onClick={() => navigate('/signup')}>Sign Up</button>
            </>
          ) : (
            <>
              <button className={getButtonClass('/persons')} onClick={() => navigate('/persons')}>View Profiles</button>
              <div style={{ position: 'relative' }}>
                <button className={getButtonClass('/inbox')} onClick={() => navigate('/inbox')}>Inbox</button>
              </div>
              <button className="btn-outline btn-small" onClick={() => navigate('/dashboard')}>Dashboard</button>
              
              <AvatarMenu onSignOut={logoutFunction} />
            </>
          )}
        </div>
      </header>

      {showRateModal && <RateDateModal onClose={() => setShowRateModal(false)} />}
    </>
  );
}
