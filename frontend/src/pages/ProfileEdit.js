import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import defaultAvatar from '../assets/default-avatar.png';
import '../App.css';

const MIN_AGE = 18;
const MAX_AGE = 120;
const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other'];
const DATING_PREFERENCE_OPTIONS = ['Men', 'Women', 'Non-binary', 'Everyone', 'Prefer not to say', 'Other'];

export default function ProfileEdit() {
  const navigate = useNavigate();
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [profile, setProfile] = useState(null);
  const [mainAlias, setMainAlias] = useState('');
  const [slug, setSlug] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [zipSuggestions, setZipSuggestions] = useState([]);
  const [age, setAge] = useState('');
  const [genderIdentity, setGenderIdentity] = useState('');
  const [datingPreference, setDatingPreference] = useState('');
  const [photoKey, setPhotoKey] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatar);

  useEffect(() => {
    (async () => {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      setAuthLoading(false);

      if (authErr || !user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('current_user_profile_view')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data) {
        setProfile(data);
        setMainAlias(data.main_alias || '');
        setSlug(data.main_alias ? slugify(data.main_alias) : '');
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setCity(data.city || '');
        setState(data.state || '');
        setZipcode(data.zipcode || '');
        setAge(data.age != null ? data.age.toString() : '');
        setGenderIdentity(data.gender_identity || '');
        setDatingPreference(data.dating_preference || '');

        if (data.photo_reference_url) {
          setPhotoKey(data.photo_reference_url);
          const { data: { publicUrl } } = supabase
            .storage
            .from('avatars')
            .getPublicUrl(data.photo_reference_url);
          setAvatarUrl(publicUrl || defaultAvatar);
        }
      }

      setLoading(false);
    })();
  }, [navigate]);

  const slugify = v => v.toString().toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

  const handleAliasChange = e => {
    const v = e.target.value;
    setMainAlias(v);
    setSlug(slugify(v));
  };

  const handleFile = async e => {
    const file = e.target.files[0];
    if (!file) return;
    const key = `avatars/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from('avatars').upload(key, file, { upsert: true });
    if (upErr) {
      setError(upErr.message);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(key);
    setPhotoKey(key);
    setAvatarUrl(publicUrl);
  };

  const handleZipcodeChange = async e => {
    const val = e.target.value;
    setZipcode(val);
    if (val.length >= 3) {
      const { data } = await supabase
        .from('zipcodes')
        .select('zipcode, city, state')
        .ilike('zipcode', `${val}%`)
        .limit(10);
      setZipSuggestions(data || []);
    } else {
      setZipSuggestions([]);
    }
  };

  const selectZipcode = ({ zipcode, city: c, state: s }) => {
    setZipcode(zipcode);
    setCity(c);
    setState(s);
    setZipSuggestions([]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const values = {
        created_by: user.id,
        main_alias: mainAlias,
        slug,
        first_name: firstName,
        last_name: lastName,
        city,
        state,
        zipcode,
        age: age === '' ? null : parseInt(age, 10),
        gender_identity: genderIdentity,
        dating_preference: datingPreference,
        photo_reference_url: photoKey,
      };

      if (profile?.poi_id) {
        const { error: upErr } = await supabase
          .from('person_of_interest')
          .update(values)
          .eq('id', profile.poi_id);
        if (upErr) throw upErr;
      } else {
        const { data: newProfile, error: insErr } = await supabase
          .from('person_of_interest')
          .insert(values)
          .single();
        if (insErr) throw insErr;
        setProfile(newProfile);
      }

      navigate(`/profiles/${slug}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return <div className="spinner">Loading…</div>;
  }

  return (
    <div className="container profile-edit-container">
      <h2>{profile ? 'Edit Profile' : 'Create Profile'}</h2>
      {error && <p className="error">{error}</p>}

      <form className="form" onSubmit={handleSubmit}>
        <label>
          Display Name
          <input type="text" value={mainAlias} onChange={handleAliasChange} required />
        </label>

        <label>
          Slug (URL)
          <input type="text" value={slug} readOnly required />
        </label>

        <label>
          First Name
          <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} />
        </label>

        <label>
          Last Name
          <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} />
        </label>

        <label>
          Age
          <select value={age} onChange={e => setAge(e.target.value)} required>
            <option value="">Select age</option>
            {Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => MIN_AGE + i).map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </label>

        <label>
          Gender Identity
          <select value={genderIdentity} onChange={e => setGenderIdentity(e.target.value)} required>
            <option value="">Select gender</option>
            {GENDER_OPTIONS.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </label>

        <label>
          Dating Preference
          <select value={datingPreference} onChange={e => setDatingPreference(e.target.value)}>
            <option value="">Select preference</option>
            {DATING_PREFERENCE_OPTIONS.map(dp => (
              <option key={dp} value={dp}>{dp}</option>
            ))}
          </select>
        </label>

        <label>
          Zip Code
          <input
            type="text"
            value={zipcode}
            onChange={handleZipcodeChange}
            placeholder="Start typing zip…"
            required
          />
          {zipSuggestions.length > 0 && (
            <ul className="zip-suggestions">
              {zipSuggestions.map(z => (
                <li key={z.zipcode} onClick={() => selectZipcode(z)}>
                  {z.zipcode} – {z.city}, {z.state}
                </li>
              ))}
            </ul>
          )}
        </label>

        <label>
          City
          <input type="text" value={city} readOnly disabled />
        </label>

        <label>
          State
          <input type="text" value={state} readOnly disabled />
        </label>

        <label>
          Photo
          <input type="file" accept="image/*" onChange={handleFile} />
        </label>

        <img src={avatarUrl} alt="avatar preview" className="avatar-preview" />

        <button type="submit" className="btn" disabled={saving}>
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
