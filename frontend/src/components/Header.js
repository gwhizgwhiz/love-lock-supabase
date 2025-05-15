import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import AvatarMenu from './AvatarMenu';
import logo from '../assets/logo.png';
import RateDateModal from './RateDateModal';
import supabase from '../supabaseClient';
import '../App.css';

export default function Header() {
  const { user, slug, avatarUrl, unreadCount } = useAuth();
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
        <Link to="/" className="header-brand">
          <img src={logo} alt="LoveLock" className="logo" />
          <span className="site-name">LoveLock</span>
        </Link>

        <div className="header-right">
          {!user ? (
            <>
              <button className="btn btn-small" onClick={() => navigate('/login')}>
                Log In
              </button>
              <button className="btn btn-small" onClick={() => navigate('/signup')}>
                Sign Up
              </button>
            </>
          ) : (
            <>
              <button className={getButtonClass('/profiles')} onClick={() => navigate('/profiles')}>
                View Profiles
              </button>

              <div style={{ position: 'relative' }}>
                <button className={getButtonClass('/inbox')} onClick={() => navigate('/inbox')}>
                  Inbox
                </button>
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
              </div>

              <button className={getButtonClass('/interactions')} onClick={() => navigate('/interactions')}>
                Interactions
              </button>

              <button className="btn-outline btn-small" onClick={() => navigate('/dashboard')}>
                Dashboard
              </button>

              <button className={getButtonClass('/my-circles')} onClick={() => navigate('/my-circles')}>
                My Circles
              </button>

              <AvatarMenu avatarUrl={avatarUrl} profileSlug={slug} onSignOut={logoutFunction} />
            </>
          )}
        </div>
      </header>

      {showRateModal && <RateDateModal onClose={() => setShowRateModal(false)} />}
    </>
  );
}