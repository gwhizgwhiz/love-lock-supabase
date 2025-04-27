// frontend/src/pages/ProfileEdit.js
import React, { useEffect, useState } from 'react';
import { useNavigate }                 from 'react-router-dom';
import supabase                        from '../supabaseClient';
import defaultAvatar                   from '../assets/default-avatar.png';
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

  // Load existing profile if one exists
  useEffect(() => {
    async function load() {
      setLoading(true);

      // 1) Get current user
      const {
        data: { user },
        error: authErr
      } = await supabase.auth.getUser();
      if (authErr || !user) {
        navigate('/login');
        return;
      }

      // 2) Fetch their person_of_interest row by created_by
      const { data, error: fetchErr } = await supabase
        .from('person_of_interest')
        .select('*')
        .eq('created_by', user.id)
        .single();

      if (fetchErr && fetchErr.code !== 'PGRST116') {
        setError(fetchErr.message);
        setLoading(false);
        return;
      }

      // 3) Populate form state if data exists
      if (data) {
        setMainAlias(data.main_alias);
        setSlug(data.slug);
        setKnownRegion(data.known_region || '');
        setPlatformsText((data.platforms || []).join(', '));
        if (data.photo_reference_url) {
          setPhotoKey(data.photo_reference_url);
          const {
            data: { publicUrl }
          } = supabase
            .storage
            .from('avatars')
            .getPublicUrl(data.photo_reference_url);
          setAvatarUrl(publicUrl || defaultAvatar);
        }
      }

      setLoading(false);
    }

    load();
  }, [navigate]);

  // Slug helper
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

  // Avatar file upload
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const key = `avatars/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase
      .storage
      .from('avatars')
      .upload(key, file, { upsert: true });
    if (upErr) {
      setError(upErr.message);
      return;
    }

    const {
      data: { publicUrl }
    } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(key);

    setPhotoKey(key);
    setAvatarUrl(publicUrl);
  };

  // Save (insert or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // a) re-fetch user to get ID
    const {
      data: { user },
      error: authErr
    } = await supabase.auth.getUser();
    if (authErr || !user) {
      setError(authErr?.message || 'Authentication required');
      setSaving(false);
      return;
    }

    // b) Upsert on created_by
    const { error: upErr } = await supabase
      .from('person_of_interest')
      .upsert(
        {
          created_by: user.id,
          main_alias: mainAlias,
          slug,
          known_region: knownRegion,
          platforms: platformsText
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          photo_reference_url: photoKey
        },
        { onConflict: 'created_by' }
      );

    if (upErr) {
      setError(upErr.message);
      setSaving(false);
      return;
    }

    // c) Navigate to the detail page
    navigate(`/profiles/${slug}`);
  };

  if (loading) return <div className="spinner">Loading…</div>;

  return (
    <div className="container profile-edit-container">
      <h2>{slug ? 'Edit' : 'Create'} Profile</h2>
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
          <input type="text" value={slug} readOnly />
        </label>

        <label>
          Known Region
          <input
            type="text"
            value={knownRegion}
            onChange={(e) => setKnownRegion(e.target.value)}
          />
        </label>

        <label>
          Platforms (comma-separated)
          <input
            type="text"
            value={platformsText}
            onChange={(e) => setPlatformsText(e.target.value)}
          />
        </label>

        <label>
          Photo
          <input type="file" accept="image/*" onChange={handleFile} />
        </label>
        <img src={avatarUrl} alt="" className="avatar-preview" />

        <button type="submit" className="btn" disabled={saving}>
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
