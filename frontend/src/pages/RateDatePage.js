// src/pages/RateDatePage.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import useCurrentUser from '../hooks/useCurrentUser'; // The consistent user wrapper
import '../App.css';

export default function RateDatePage() {
  const navigate = useNavigate();
  const { userId, userLoading } = useCurrentUser(); // Consistent user hook
  const [aliasInput, setAliasInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedAlias, setSelectedAlias] = useState(null);
  const [manualEntry, setManualEntry] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [selectedPOI, setSelectedPOI] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [dateOfExperience, setDateOfExperience] = useState('');
  const [profileMatchVote, setProfileMatchVote] = useState('');
  const [whatWentRight, setWhatWentRight] = useState('');
  const [whatWentWrong, setWhatWentWrong] = useState('');
  const [rating, setRating] = useState(5);
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const debouncedSearch = useCallback(
    debounce(async (value) => {
      if (!value.trim()) return setSuggestions([]);
      const { data, error } = await supabase
        .from('poi_profiles')
        .select('id, alias, poi_id')
        .ilike('alias', `%${value}%`);
      if (!error) setSuggestions(data);
    }, 300),
    []
  );

  const handleAliasChange = (e) => {
    const value = e.target.value;
    setAliasInput(value);
    setShowSuggestions(true);
    setManualEntry(false);
    debouncedSearch(value);
  };

  const handleAliasSelect = (profile) => {
    setAliasInput(profile.alias);
    setSelectedAlias(profile);
    setShowSuggestions(false);
    selectPOI(profile.poi_id);
  };

  const handleManualProceed = () => {
    setManualEntry(true);
    setShowSuggestions(false);
    createPOIAndProfile(aliasInput);
  };

  async function selectPOI(poi_id) {
    const { data: poi } = await supabase
      .from('person_of_interest')
      .select('*')
      .eq('id', poi_id)
      .single();
    setSelectedPOI(poi);
    const { data: profilesData } = await supabase
      .from('poi_profiles')
      .select('*')
      .eq('poi_id', poi_id);
    setProfiles(profilesData || []);
  }

  async function createPOIAndProfile(aliasValue) {
    const { data: poi, error: poiErr } = await supabase
      .from('person_of_interest')
      .insert([{ main_alias: aliasValue, created_by: userId }])
      .select()
      .single();
    if (poiErr) return setError(poiErr.message);
    const { data: profile, error: profileErr } = await supabase
      .from('poi_profiles')
      .insert([{ poi_id: poi.id, alias: aliasValue, platform: 'Unknown' }])
      .select()
      .single();
    if (profileErr) return setError(profileErr.message);
    setSelectedPOI(poi);
    setProfiles([profile]);
    setSelectedProfileId(profile.id);
  }

  async function handleScreenshotUpload() {
    if (!screenshotFile) return null;
    const ext = screenshotFile.name.split('.').pop();
    const path = `screenshots/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('screenshots').upload(path, screenshotFile);
    if (error) return null;
    const { data } = supabase.storage.from('screenshots').getPublicUrl(path);
    return data?.publicUrl;
  }

  async function submitExperience() {
    if (!userId || !selectedPOI || !selectedProfileId || !dateOfExperience) {
      setError('Missing required fields.');
      return;
    }
    setLoading(true);
    setError('');
    const screenshot = await handleScreenshotUpload();
    const { error: insErr } = await supabase.from('person_experiences').insert({
      poi_id: selectedPOI.id,
      profile_id: selectedProfileId,
      reporter_id: userId,
      rating,
      date_of_experience: dateOfExperience,
      profile_match_vote: profileMatchVote,
      what_went_right: whatWentRight,
      what_went_wrong: whatWentWrong,
      screenshot_url: screenshot,
      verified_with_screenshot: !!screenshot,
    });
    setLoading(false);
    if (insErr) {
      setError(insErr.message);
    } else {
      setSuccess(true);
      resetForm();
    }
  }

  function resetForm() {
    setAliasInput('');
    setSelectedAlias(null);
    setManualEntry(false);
    setSelectedPOI(null);
    setProfiles([]);
    setSelectedProfileId(null);
    setDateOfExperience('');
    setProfileMatchVote('');
    setWhatWentRight('');
    setWhatWentWrong('');
    setRating(5);
    setScreenshotFile(null);
  }

  if (userLoading) return <div className="spinner">Loading…</div>;

  return (
    <div className="container">
      <h1>Rate a Date</h1>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">Experience submitted!</p>}
      {!selectedPOI && (
        <div className="input-group">
          <label>Search or Enter Alias:</label>
          <input
            type="text"
            value={aliasInput}
            onChange={handleAliasChange}
            onFocus={() => setShowSuggestions(true)}
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="invite-suggestions">
              {suggestions.map((s) => (
                <li key={s.id} onClick={() => handleAliasSelect(s)}>
                  {s.alias}
                </li>
              ))}
            </ul>
          )}
          {showSuggestions && suggestions.length === 0 && (
            <button className="btn-outline" onClick={handleManualProceed}>
              Create Profile for “{aliasInput}”
            </button>
          )}
        </div>
      )}
      {selectedPOI && (
        <div className="form">
          <div className="input-group">
            <label>Date of Experience:</label>
            <input type="date" value={dateOfExperience} onChange={(e) => setDateOfExperience(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Was their profile accurate?</label>
            <select value={profileMatchVote} onChange={(e) => setProfileMatchVote(e.target.value)} required>
              <option value="">Select...</option>
              <option value="accurate">Yes</option>
              <option value="inaccurate">No</option>
              <option value="unsure">Not Sure</option>
            </select>
          </div>
          <div className="input-group">
            <label>What went right?</label>
            <textarea value={whatWentRight} onChange={(e) => setWhatWentRight(e.target.value)} />
          </div>
          <div className="input-group">
            <label>What went wrong?</label>
            <textarea value={whatWentWrong} onChange={(e) => setWhatWentWrong(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Rating (1–5):</label>
            <input type="number" min="1" max="5" value={rating} onChange={(e) => setRating(Number(e.target.value))} />
          </div>
          <div className="input-group">
            <label>Upload screenshot of profile:</label>
            <input type="file" accept="image/*" onChange={(e) => setScreenshotFile(e.target.files[0])} />
          </div>
          <button className="btn" onClick={submitExperience} disabled={loading}>
            {loading ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      )}
    </div>
  );
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
