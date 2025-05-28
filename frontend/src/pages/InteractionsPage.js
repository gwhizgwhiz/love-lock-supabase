// src/pages/InteractionsPage.jsx
import { useState, useEffect } from 'react';
import Select from 'react-select';
import supabase from '../supabaseClient';
import useCurrentUser from '../hooks/useCurrentUser';
import resolveAvatarUrl from '../lib/resolveAvatarUrl';
import defaultAvatar from '../assets/default-avatar.png';
import '../App.css';

export default function InteractionsPage() {
  const { userId, loading: userLoading } = useCurrentUser();

  const [poiOptions, setPoiOptions] = useState([]);
  const [selectedPoi, setSelectedPoi] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchInput) return;

      const { data, error } = await supabase
        .from('person_of_interest')
        .select('id, main_alias, platform, avatar_url, city, state, trust_score')
        .ilike('main_alias', `%${searchInput}%`);

      if (!error && data) {
        const enriched = await Promise.all(
          data.map(async (p) => ({
            value: p.id,
            label: p.main_alias,
            data: {
              ...p,
              avatar_url: await resolveAvatarUrl(p.avatar_url),
            },
          }))
        );
        setPoiOptions(enriched);
      } else if (error) {
        console.error('Failed to load POI options:', error);
      }
    };

    fetchSuggestions();
  }, [searchInput]);

  const [form, setForm] = useState({
    date_of_experience: '',
    locations: '',
    profile_match_vote: '',
    profile_inaccuracies: [],
    what_went_right: '',
    what_went_wrong: '',
    screenshot_url: '',
    verified_with_screenshot: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePoiChange = (selected) => {
    setSelectedPoi(selected);
  };

  const CustomOption = (props) => {
    const { data, innerRef, innerProps } = props;
    const poi = data.data;

    return (
      <div ref={innerRef} {...innerProps} className="select-option">
        <img src={poi.avatar_url || defaultAvatar} alt={poi.main_alias} className="avatar-thumb" />
        <div className="select-info">
          <div className="alias">
            {poi.main_alias} <small>({poi.platform || '-'})</small>
          </div>
          <div className="location">{poi.city || '–'}, {poi.state || ''}</div>
          <div className="trust">❤️ {poi.trust_score ?? 0}</div>
        </div>
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    if (!userId || !selectedPoi || !form.date_of_experience) {
      setError('Please complete all required fields.');
      setSubmitting(false);
      return;
    }

    const payload = {
      person_id: selectedPoi.value,
      reporter_id: userId,
      date_of_experience: form.date_of_experience,
      locations: form.locations,
      profile_match_vote: form.profile_match_vote,
      profile_inaccuracies: form.profile_inaccuracies.join(','),
      what_went_right: form.what_went_right,
      what_went_wrong: form.what_went_wrong,
      screenshot_url: form.screenshot_url,
      verified_with_screenshot: form.verified_with_screenshot,
    };

    const { error: insertError } = await supabase.from('person_experiences').insert([payload]);

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccessMessage('Interaction logged successfully!');
      setForm({
        date_of_experience: '',
        locations: '',
        profile_match_vote: '',
        profile_inaccuracies: [],
        what_went_right: '',
        what_went_wrong: '',
        screenshot_url: '',
        verified_with_screenshot: false,
      });
      setSelectedPoi(null);
      setSearchInput('');
    }

    setSubmitting(false);
  };

  return (
    <div className="container">
      <h2>Log an Interaction</h2>

      {error && <p className="error">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Search for a person</label>
          <Select
            options={poiOptions}
            onInputChange={(val) => setSearchInput(val)}
            onChange={handlePoiChange}
            getOptionLabel={(e) => e.label}
            components={{ Option: CustomOption }}
            placeholder="Start typing a name…"
            isClearable
            value={selectedPoi}
          />
        </div>

        <div className="input-group">
          <label>Date of Experience *</label>
          <input
            type="date"
            name="date_of_experience"
            value={form.date_of_experience}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="input-group">
          <label>Location(s)</label>
          <input
            type="text"
            name="locations"
            value={form.locations}
            onChange={handleInputChange}
            placeholder="Enter location(s)"
          />
        </div>

        <div className="input-group">
          <label>Profile Match Vote</label>
          <select
            name="profile_match_vote"
            value={form.profile_match_vote}
            onChange={handleInputChange}
          >
            <option value="">Select...</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="partial">Partial</option>
          </select>
        </div>

        <div className="input-group">
          <label>What Went Right?</label>
          <textarea
            name="what_went_right"
            value={form.what_went_right}
            onChange={handleInputChange}
            placeholder="Describe what went well…"
          />
        </div>

        <div className="input-group">
          <label>What Went Wrong?</label>
          <textarea
            name="what_went_wrong"
            value={form.what_went_wrong}
            onChange={handleInputChange}
            placeholder="Describe what went wrong…"
          />
        </div>

        <div className="input-group">
          <label>Screenshot URL (optional)</label>
          <input
            type="url"
            name="screenshot_url"
            value={form.screenshot_url}
            onChange={handleInputChange}
          />
        </div>

        <div className="input-group">
          <label>
            <input
              type="checkbox"
              name="verified_with_screenshot"
              checked={form.verified_with_screenshot}
              onChange={handleInputChange}
            />{' '}
            Verified with Screenshot
          </label>
        </div>

        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Log Interaction'}
        </button>
      </form>
    </div>
  );
}
