// src/pages/ProfileEdit.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import useCurrentUser from '../hooks/useCurrentUser';
import defaultAvatar from '../assets/default-avatar.png';
import uploadAvatar from '../lib/uploadAvatar';
import '../App.css';

export default function ProfileEdit() {
  const navigate = useNavigate();

  const {
    userId,
    profile,
    slug,
    avatarUrl: initialAvatarUrl,
    loading: authLoading,
    error: authError,
    refetch
  } = useCurrentUser();

  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [preference, setPreference] = useState('');
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipcode, setZipCode] = useState('');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(defaultAvatar);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading || !userId) return;

    if (profile) {
      setName(profile.name || '');
      setGender(profile.gender_identity || '');
      setPreference(profile.dating_preference || '');
      setAge(typeof profile.age === 'number' ? String(profile.age) : '');
      setCity(profile.city || '');
      setState(profile.state || '');
      setZipCode(profile.zipcode || '');
      setLat(profile.lat || null);
      setLng(profile.lng || null);
      setAvatarPreview(initialAvatarUrl || defaultAvatar);
    } else {
      setName('');
      setGender('');
      setPreference('');
      setAge('');
      setCity('');
      setState('');
      setZipCode('');
      setLat(null);
      setLng(null);
      setAvatarPreview(initialAvatarUrl || defaultAvatar);
    }
  }, [authLoading, userId, profile, initialAvatarUrl]);

  useEffect(() => {
    const fetchZip = async () => {
      if (zipcode.length !== 5) return;
      const { data, error } = await supabase
        .from('zipcodes')
        .select('city, state, lat, lng')
        .eq('zipcode', zipcode)
        .single();

      if (error) {
        console.warn('Zipcode lookup failed:', error);
        setCity('');
        setState('');
        setLat(null);
        setLng(null);
      } else if (data) {
        setCity(data.city);
        setState(data.state);
        setLat(data.lat);
        setLng(data.lng);
      }
    };
    fetchZip();
  }, [zipcode]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      let newAvatarKey = profile?.avatar_url || null;

      if (avatarFile) {
        newAvatarKey = await uploadAvatar(avatarFile, userId);
      }

      const updates = {
        user_id: userId,
        name: name.trim(),
        gender_identity: gender,
        dating_preference: preference,
        age: age === '' ? null : parseInt(age, 10),
        city,
        state,
        zipcode,
        lat,
        lng,
        avatar_url: newAvatarKey,
        is_public: true
      };

      let error;
      if (profile) {
        const { error: updateErr } = await supabase
          .from('profiles')
          .update(updates)
          .eq('user_id', userId);
        error = updateErr;
      } else {
        const { error: insertErr } = await supabase
          .from('profiles')
          .insert(updates);
        error = insertErr;
      }

      if (error) throw error;

      await refetch();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !userId) {
    return (
      <div className="loading-container">
        <div className="loading-logo" />
      </div>
    );
  }

  if (authError) {
    return <p className="error-message">{authError}</p>;
  }

  return (
    <div className="container profile-edit-container">
      <section className='dashboard-section'>
        <h2 className="dashboard-heading">{profile ? 'Edit Your Profile' : 'Create Your Profile'}</h2>
        {error && <p className="error-message">{error}</p>}
        <form className="profile-edit-form" onSubmit={handleSubmit}>
          <div className="profile-edit-avatar">
            <img src={avatarPreview} alt="Avatar preview" className="avatar-large" />
            <div className="upload-container">
              <label>
                Upload New Photo
                <input type="file" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
          </div>
          <div className="profile-edit-fields">
            <label>Name
              <input type="text" value={name} onChange={e => setName(e.target.value)} required />
            </label>
            <label>Gender Identity
              <select value={gender} onChange={e => setGender(e.target.value)} required>
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Non-binary</option>
                <option>Prefer not to say</option>
                <option>Other</option>
              </select>
            </label>
            <label>Dating Preference
              <select value={preference} onChange={e => setPreference(e.target.value)}>
                <option value="">Select preference</option>
                <option>Men</option>
                <option>Women</option>
                <option>Non-binary</option>
                <option>Everyone</option>
                <option>Prefer not to say</option>
                <option>Other</option>
              </select>
            </label>
            <label>Age
              <input type="number" min="18" max="120" value={age} onChange={e => setAge(e.target.value)} />
            </label>
            <label>City
              <input type="text" value={city} onChange={e => setCity(e.target.value)} />
            </label>
            <label>State
              <input type="text" value={state} onChange={e => setState(e.target.value)} />
            </label>
            <label>Zip Code
              <input type="text" value={zipcode} onChange={e => setZipCode(e.target.value)} />
            </label>
          </div>
          <button type="submit" className="btn" disabled={saving}>
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      </section>
    </div>
  );
}
