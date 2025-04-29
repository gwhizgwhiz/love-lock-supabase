// src/pages/ProfileEdit.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate }                from 'react-router-dom';
import supabase                       from '../supabaseClient';
import defaultAvatar                  from '../assets/default-avatar.png';
import '../App.css';

export default function ProfileEdit() {
  const navigate                     = useNavigate();
  const [authLoading, setAuthLoading]= useState(true);
  const [loading, setLoading]        = useState(true);
  const [saving, setSaving]          = useState(false);
  const [error, setError]            = useState(null);

  // form state
  const [profile, setProfile]        = useState(null);
  const [mainAlias, setMainAlias]    = useState('');
  const [slug, setSlug]              = useState('');
  const [knownRegion, setKnownRegion]= useState('');
  const [platformsText, setPlatformsText] = useState('');
  const [photoKey, setPhotoKey]      = useState('');
  const [avatarUrl, setAvatarUrl]    = useState(defaultAvatar);

  // load user + existing profile row
  useEffect(() => {
    (async () => {
      setAuthLoading(true);
      // 1) get user
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      setAuthLoading(false);
      if (authErr || !user) {
        navigate('/login');
        return;
      }

      // 2) fetch existing person_of_interest
      const { data, error: fetchErr } = await supabase
        .from('person_of_interest')
        .select('id, main_alias, slug, known_region, platforms, photo_reference_url')
        .eq('created_by', user.id)
        .single();

      if (fetchErr && fetchErr.code !== 'PGRST116') {
        setError(fetchErr.message);
        setLoading(false);
        return;
      }

      if (data) {
        setProfile(data);
        setMainAlias(data.main_alias || '');
        setSlug(data.slug || '');
        setKnownRegion(data.known_region || '');
        setPlatformsText((data.platforms || []).join(', '));
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

  // slugify helper on alias
  const slugify = v =>
    v.toString().toLowerCase().trim().replace(/[\s\W-]+/g, '-');

  const handleAliasChange = e => {
    const v = e.target.value;
    setMainAlias(v);
    setSlug(slugify(v));
  };

  // file upload
  const handleFile = async e => {
    const file = e.target.files[0];
    if (!file) return;
    const key = `avatars/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase
      .storage.from('avatars')
      .upload(key, file, { upsert: true });
    if (upErr) {
      setError(upErr.message);
      return;
    }
    const { data: { publicUrl } } = supabase
      .storage.from('avatars')
      .getPublicUrl(key);
    setPhotoKey(key);
    setAvatarUrl(publicUrl);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // build payload
    const values = {
      created_by:        (await supabase.auth.getUser()).data.user.id,
      main_alias:        mainAlias,
      slug,
      known_region:      knownRegion,
      platforms:         platformsText.split(',').map(s => s.trim()).filter(Boolean),
      photo_reference_url: photoKey
    };

    try {
      if (profile?.id) {
        // update existing row
        let { error: upErr } = await supabase
          .from('person_of_interest')
          .update(values)
          .eq('id', profile.id);
        if (upErr) throw upErr;
      } else {
        // insert new
        let { data: newProfile, error: insErr } = await supabase
          .from('person_of_interest')
          .insert(values)
          .single();
        if (insErr) throw insErr;
        // setProfile if you want to stay on the edit screen
        setProfile(newProfile);
      }
      // finally, go to the public profile
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
          <input
            type="text"
            value={mainAlias}
            onChange={handleAliasChange}
            required
          />
        </label>

        <label>
          Slug (URL)
          <input
            type="text"
            value={slug}
            readOnly
            required
          />
        </label>

        <label>
          Known Region
          <input
            type="text"
            value={knownRegion}
            onChange={e => setKnownRegion(e.target.value)}
          />
        </label>

        <label>
          Platforms (comma-separated)
          <input
            type="text"
            value={platformsText}
            onChange={e => setPlatformsText(e.target.value)}
          />
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
