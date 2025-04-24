// frontend/src/pages/Settings.js
import React, { useEffect, useState } from 'react';
import supabase from '../supabaseClient';
import '../App.css';

export default function Settings() {
  const [user, setUser]       = useState(null);
  const [form, setForm]       = useState({ email: '', password: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Load current user and their avatar URL (if any)
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        setForm(f => ({ ...f, email: data.user.email }));
        const url = data.user.user_metadata?.avatar_url;
        if (url) setAvatarPreview(url);
      }
    });
  }, []);

  // Handle avatar selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // Main save handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    // 1) If avatarFile, upload it
    let avatar_url = user.user_metadata?.avatar_url;
    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const { data, error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(fileName, avatarFile, { upsert: true });
      if (uploadError) {
        setMessage({ type: 'error', text: uploadError.message });
        setLoading(false);
        return;
      }
      avatar_url = supabase
        .storage
        .from('avatars')
        .getPublicUrl(fileName).data.publicUrl;
    }

    // 2) Build update payload
    const updates = {};
    if (form.email !== user.email) updates.email = form.email;
    if (form.password) updates.password = form.password;
    if (avatar_url && avatar_url !== user.user_metadata?.avatar_url) {
      updates.data = { ...user.user_metadata, avatar_url };
    }

    if (!Object.keys(updates).length) {
      setMessage({ type: 'info', text: 'No changes to save.' });
      setLoading(false);
      return;
    }

    // 3) Call updateUser
    const { data, error } = await supabase.auth.updateUser(updates);
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Settings saved.' });
      setUser(data.user);
      setForm(f => ({ ...f, password: '' }));
      setAvatarFile(null);
    }
    setLoading(false);
  };

  return (
    <div className="page-container">
      <h2>Account Settings</h2>
      {message && <div className={`alert ${message.type}`}>{message.text}</div>}
      <form onSubmit={handleSubmit} className="settings-form">

        {/* Avatar upload */}
        <div className="input-group avatar-group">
          <label>Avatar</label>
          {avatarPreview && (
            <img src={avatarPreview} alt="Avatar Preview" className="avatar-preview" />
          )}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleAvatarChange} 
            disabled={loading} 
          />
        </div>

        {/* Email */}
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            id="email" name="email" type="email"
            value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            disabled={loading} required
          />
        </div>

        {/* Password toggle */}
        <div className="input-group password-group">
          <label htmlFor="password">New Password</label>
          <div className="password-input-wrapper">
            <input
              id="password" name="password"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              disabled={loading}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPass(v => !v)}
              aria-label={showPass ? 'Hide password' : 'Show password'}
            >
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
