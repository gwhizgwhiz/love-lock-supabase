// src/pages/InteractionsPage.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Select from 'react-select';
import supabase from '../supabaseClient';
import useCurrentUser from '../hooks/useCurrentUser';
import resolveAvatarUrl from '../lib/resolveAvatarUrl';
import defaultAvatar from '../assets/default-avatar.png';
import TrustDisplay from '../components/TrustDisplay';
import '../App.css';

const defaultForm = {
  date_of_experience: '',
  locations: '',
  profile_match_vote: '',
  profile_inaccuracies: [],
  what_went_right: '',
  what_went_wrong: '',
  screenshot_url: '',
  verified_with_screenshot: false,
  meet_type: '',
  platform: '',
  alias: '',
};

export default function InteractionsPage() {
  const { userId, loading: userLoading } = useCurrentUser();
  const [searchParams] = useSearchParams();
  const poiIdFromUrl = searchParams.get('poiId');

  const [poiOptions, setPoiOptions] = useState([]);
  const [selectedPoi, setSelectedPoi] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    const fetchPOIById = async () => {
      if (!poiIdFromUrl) return;
      setError('');
      try {
        const { data, error } = await supabase
          .from('person_of_interest')
          .select('id, main_alias, platform, avatar_url, city, state, trust_score')
          .eq('id', poiIdFromUrl)
          .single();

        if (error || !data) {
          setError('POI not found.');
        } else {
          const enrichedPOI = {
            value: data.id,
            label: data.main_alias,
            data: { ...data, avatar_url: await resolveAvatarUrl(data.avatar_url) },
          };
          setSelectedPoi(enrichedPOI);
        }
      } catch (err) {
        console.error('Error fetching POI:', err);
        setError('Error loading POI.');
      }
    };

    fetchPOIById();
  }, [poiIdFromUrl]);

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
            data: { ...p, avatar_url: await resolveAvatarUrl(p.avatar_url) },
          }))
        );
        setPoiOptions(enriched);
      } else if (error) {
        console.error('Failed to load POI options:', error);
      }
    };

    fetchSuggestions();
  }, [searchInput]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleInaccuraciesChange = (e) => {
    const { value, checked } = e.target;
    setForm((prev) => {
      const current = new Set(prev.profile_inaccuracies);
      checked ? current.add(value) : current.delete(value);
      return { ...prev, profile_inaccuracies: Array.from(current) };
    });
  };

  const handlePoiChange = (selected) => {
    setSelectedPoi(selected);
  };

  const CustomOption = ({ data, innerRef, innerProps }) => {
    const poi = data.data;
    return (
      <div ref={innerRef} {...innerProps} className="select-option">
        <img src={poi.avatar_url || defaultAvatar} alt={poi.main_alias} className="avatar-thumb" />
        <div className="select-info">
          <div className="alias">{poi.main_alias} <small>({poi.platform || '-'})</small></div>
          <div className="location">{poi.city || '—'}, {poi.state || ''}</div>
          <TrustDisplay score={poi.trust_score} />
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

    const rawPayload = {
      poi_id: selectedPoi?.value,
      reporter_id: userId,
      date_of_experience: form.date_of_experience,
      profile_match_vote: form.profile_match_vote || null,
      what_went_right: form.what_went_right || null,
      what_went_wrong: form.what_went_wrong || null,
      screenshot_url: form.screenshot_url || null,
      verified_with_screenshot: form.verified_with_screenshot || false,
      meet_type: form.meet_type || null,
      platform: form.platform || null,
      alias: form.alias || null,
      locations: form.locations || null,
      profile_inaccuracies: form.profile_inaccuracies || [],
    };

    const payload = Object.fromEntries(
      Object.entries(rawPayload).filter(([_, v]) => v !== undefined)
    );

    const { error: insertError } = await supabase.from('interactions').insert([payload]);

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccessMessage('Interaction logged successfully!');
      setForm(defaultForm);
      setSelectedPoi(null);
      setSearchInput('');
    }

    setSubmitting(false);
  };

  return (
    <div className="container profile-edit-container">
      <section className="dashboard-section">
        <h2 className="dashboard-heading">Log an Interaction</h2>
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <form className="profile-edit-form" onSubmit={handleSubmit}>
          <div className="profile-edit-fields">
            {selectedPoi ? (
              <div className="poi-summary">
                <img src={selectedPoi.data.avatar_url || defaultAvatar} alt={selectedPoi.label} className="hero-avatar" />
                <div><strong>{selectedPoi.label}</strong></div>
                <div><small>({selectedPoi.data.platform || '-'})</small></div>
                <span>{selectedPoi.data.city || '—'}, {selectedPoi.data.state || ''}</span>
                <TrustDisplay score={selectedPoi.data.trust_score} />
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>

          <div className="profile-edit-fields">
            <label>Date of Experience *</label>
            <input type="date" name="date_of_experience" value={form.date_of_experience} onChange={handleInputChange} required />
          </div>

          <div className="profile-edit-fields">
            <label>Alias / Screen Name</label>
            <input type="text" name="alias" value={form.alias} onChange={handleInputChange} />
          </div>

          <div className="profile-edit-fields">
            <label>How did you meet? *</label>
            <select name="meet_type" value={form.meet_type} onChange={handleInputChange} required>
              <option value="">Select...</option>
              <option value="online">Online</option>
              <option value="in_person">In Person</option>
            </select>
          </div>

          {form.meet_type === 'online' && (
            <div className="profile-edit-fields">
              <label>Platform</label>
              <select name="platform" value={form.platform} onChange={handleInputChange}>
                <option value="">Select...</option>
                <option value="Tinder">Tinder</option>
                <option value="Bumble">Bumble</option>
                <option value="Hinge">Hinge</option>
                <option value="OkCupid">OkCupid</option>
                <option value="Other">Other</option>
              </select>
            </div>
          )}

          <div className="profile-edit-fields">
            <label>Location(s)</label>
            <input type="text" name="locations" value={form.locations} onChange={handleInputChange} />
          </div>

          <div className="profile-edit-fields">
            <label>Profile Match Vote</label>
            <select name="profile_match_vote" value={form.profile_match_vote} onChange={handleInputChange}>
              <option value="">Select...</option>
              <option value="accurate">Accurate</option>
              <option value="inaccurate">Inaccurate</option>
              <option value="unsure">Unsure</option>
            </select>
          </div>

          {form.profile_match_vote === 'inaccurate' && (
            <div className="profile-edit-fields">
              <label>What was inaccurate?</label>
              {['Looks better', 'Looks worse', 'Older', 'Younger', 'Shorter', 'Taller', 'Heavier', 'Thinner', 'Hair', 'No hair'].map((label) => (
                <div key={label}>
                  <label>
                    <input
                      type="checkbox"
                      value={label}
                      checked={form.profile_inaccuracies.includes(label)}
                      onChange={handleInaccuraciesChange}
                    />{' '}{label}
                  </label>
                </div>
              ))}
            </div>
          )}

          <div className="profile-edit-fields">
            <label>What Went Right?</label>
            <textarea name="what_went_right" value={form.what_went_right} onChange={handleInputChange} />
          </div>

          <div className="profile-edit-fields">
            <label>What Went Wrong?</label>
            <textarea name="what_went_wrong" value={form.what_went_wrong} onChange={handleInputChange} />
          </div>

          <div className="profile-edit-fields">
            <label>Screenshot URL</label>
            <input type="url" name="screenshot_url" value={form.screenshot_url} onChange={handleInputChange} />
          </div>

          <div className="profile-edit-fields">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="verified_with_screenshot"
                checked={form.verified_with_screenshot}
                onChange={handleInputChange}
              />
              <span>Verified with Screenshot</span>
            </label>
          </div>

          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Log Interaction'}
          </button>
        </form>
      </section>
    </div>
  );
}
