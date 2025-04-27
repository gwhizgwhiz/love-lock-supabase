// frontend/src/pages/ProfileEdit.js
import React, { useEffect, useState } from 'react';
import { useNavigate }                     from 'react-router-dom';
import supabase                            from '../supabaseClient';
import defaultAvatar                       from '../assets/default-avatar.png';
import '../App.css';

export default function ProfileEdit() {
  const navigate = useNavigate();
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState(null);

  const [mainAlias, setMainAlias]         = useState('');
  const [slug, setSlug]                   = useState('');
  const [knownRegion, setKnownRegion]     = useState('');
  const [platformsText, setPlatformsText] = useState('');
  const [photoKey, setPhotoKey]           = useState('');
  const [avatarUrl, setAvatarUrl]         = useState(defaultAvatar);

  // 1) Load existing POI for this user (if any)
  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // fetch their POI row
      let { data, error } = await supabase
        .from('person_of_interest')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // some real error
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data) {
        setMainAlias(data.main_alias);
        setSlug(data.slug);
        setKnownRegion(data.known_region || '');
        setPlatformsText((data.platforms || []).join(', '));
        if (data.photo_reference_url) {
          setPhotoKey(data.photo_reference_url);
          const { data: urlData } = supabase
            .storage
            .from('avatars')
            .getPublicUrl(data.photo_reference_url);
          setAvatarUrl(urlData.publicUrl || defaultAvatar);
        }
      }
      setLoading(false);
    }
    load();
  }, [navigate]);

  // 2) Helpers
  const slugify = (text) =>
    text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-');

  const handleAliasChange = (e) => {
    const v = e.target.value;
    setMainAlias(v);
    setSlug(slugify(v));
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // choose a unique key
    const key = `avatars/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase
      .storage
      .from('avatars')
      .upload(key, file, { upsert: true });
    if (upErr) {
      setError(upErr.message);
      return;
    }

    const { data: urlData } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(key);

    setPhotoKey(key);
    setAvatarUrl(urlData.publicUrl);
  };

  // 3) Save handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { data, error: upErr } = await supabase
      .from('person_of_interest')
      .upsert(
        {
          user_id:           supabase.auth.getUser().then(r => r.data.user.id),
          main_alias:        mainAlias,
          slug,
          known_region:      knownRegion,
          platforms:         platformsText.split(',').map(s => s.trim()).filter(Boolean),
          photo_reference_url: photoKey
        },
        { onConflict: 'user_id' }
      );

    if (upErr) {
      setError(upErr.message);
      setSaving(false);
      return;
    }

    // success!
    navigate(`/profiles/${slug}`);
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div className="profile-edit-container">
      <h2>{slug ? 'Edit' : 'Create'} Profile</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
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
          <input type="text" value={slug} readOnly />
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
        <img src={avatarUrl} alt="" className="avatar-preview" />

        <button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
