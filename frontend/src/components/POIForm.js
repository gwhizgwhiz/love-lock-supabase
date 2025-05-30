import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import useCurrentUser from '../hooks/useCurrentUser';
import axios from 'axios';
import '../App.css';

const platforms = ['Tinder', 'Bumble', 'Hinge', 'Coffee Meets Bagel', 'Match', 'eHarmony', 'OkCupid', 'Other'];

export default function PersonsOfInterestForm() {
  const navigate = useNavigate();
  const { userId, loading: userLoading } = useCurrentUser();
  const [form, setForm] = useState({
    main_alias: '',
    first_name: '',
    last_name: '',
    gender_identity: '',
    dating_preference: '',
    age: '',
    meet_type: '',
    where_met: '',
    platform: '',
    zip: '',
    city: '',
    state: '',
    avatar_url: null,
    screenshots: [],
    is_public: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'screenshots') {
      setForm((prev) => ({ ...prev, screenshots: files }));
    } else if (name === 'avatar_url') {
      setForm((prev) => ({ ...prev, avatar_url: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleZipLookup = async () => {
    if (!form.zip) return;
    try {
      const res = await axios.get(`https://api.zippopotam.us/us/${form.zip}`);
      const { places } = res.data;
      setForm((prev) => ({
        ...prev,
        city: places[0]['place name'],
        state: places[0]['state abbreviation'],
      }));
    } catch (err) {
      console.error('Invalid Zip Code');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!userId) {
      navigate('/create-profile');
      return;
    }
    if (!form.main_alias || (!form.where_met && !form.platform)) {
      setError('Please provide a Display Name and either a meeting location or a platform.');
      return;
    }

    setLoading(true);
    try {
      const { data: existingPOI } = await supabase
        .from('person_of_interest')
        .select('id')
        .ilike('main_alias', form.main_alias)
        .eq('city', form.city)
        .eq('state', form.state)
        .eq('platform', form.platform);

      let poiId;
      if (existingPOI && existingPOI.length > 0) {
        poiId = existingPOI[0].id;
      } else {
        let avatarUrl = null;
        if (form.avatar_url) {
          const { data, error } = await supabase.storage
            .from('avatars')
            .upload(`poi_avatars/${Date.now()}_${form.avatar_url.name}`, form.avatar_url);
          if (error) throw error;
          avatarUrl = supabase.storage.from('avatars').getPublicUrl(data.path).publicUrl;
        }

        let screenshotUrls = [];
        if (form.screenshots.length > 0) {
          const uploads = await Promise.all(
            Array.from(form.screenshots).map(async (file) => {
              const { data, error } = await supabase.storage
                .from('screenshots')
                .upload(`poi_screenshots/${Date.now()}_${file.name}`, file);
              if (error) throw error;
              return supabase.storage.from('screenshots').getPublicUrl(data.path).publicUrl;
            })
          );
          screenshotUrls = uploads;
        }

        const { data: newPOI } = await supabase.from('person_of_interest').insert([{
          main_alias: form.main_alias,
          first_name: form.first_name,
          last_name: form.last_name,
          gender_identity: form.gender_identity,
          dating_preference: form.dating_preference,
          age: form.age ? parseInt(form.age) : null,
          platform: form.platform,
          zip: form.zip,
          city: form.city,
          state: form.state,
          avatar_url: avatarUrl,
          screenshots: screenshotUrls,
          is_public: form.is_public,
        }]).select().single();
        poiId = newPOI.id;
      }

      await supabase.from('interactions').insert([{
        poi_id: poiId,
        reporter_id: userId,
        where_met: form.where_met,
        where_ended: form.where_ended,
        platform: form.platform,
        alias: form.main_alias,
        meet_type: form.meet_type,
      }]);

      navigate('/persons');
    } catch (err) {
      console.error('Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (userLoading || loading) return <div className="spinner">Loading...</div>;

  return (
    <div className="container dashboard-container">
      <h2 className="dashboard-heading">Add a Person of Interest</h2>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        {/* About the Person */}
        <section className="dashboard-section">
          <div className="section-header">
            <h3>About the Person</h3>
          </div>
          {['main_alias', 'first_name', 'last_name'].map((f) => (
            <div className="form-control" key={f}>
              <label>{f.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</label>
              <input name={f} value={form[f]} onChange={handleChange} />
            </div>
          ))}
          <div className="form-control">
            <label>Gender Identity</label>
            <select name="gender_identity" value={form.gender_identity} onChange={handleChange}>
              <option value="">Select gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Non-binary</option>
              <option>Other</option>
            </select>
          </div>
          <div className="form-control">
            <label>Dating Preference</label>
            <select name="dating_preference" value={form.dating_preference} onChange={handleChange}>
              <option value="">Select preference</option>
              <option>Men</option>
              <option>Women</option>
              <option>Everyone</option>
            </select>
          </div>
          <div className="form-control">
            <label>Age</label>
            <input type="number" name="age" value={form.age} onChange={handleChange} />
          </div>
        </section>

        {/* How Did You Meet */}
        <section className="dashboard-section">
          <div className="section-header">
            <h3>How Did You Meet?</h3>
          </div>
          <div className="form-control">
            <label>
              <input type="radio" name="meet_type" value="in_person" checked={form.meet_type === 'in_person'} onChange={handleChange} /> In Person
            </label>
          </div>
          {form.meet_type === 'in_person' && (
            <div className="form-control">
              <label>Where Did You Meet Up?</label>
              <input name="where_met" value={form.where_met} onChange={handleChange} placeholder="e.g., Coffee Shop" />
            </div>
          )}
          <div className="form-control">
            <label>
              <input type="radio" name="meet_type" value="online" checked={form.meet_type === 'online'} onChange={handleChange} /> Online
            </label>
          </div>
          {form.meet_type === 'online' && (
            <div className="form-control">
              <label>Dating Platform</label>
              <select name="platform" value={form.platform} onChange={handleChange}>
                <option value="">Select platform</option>
                {platforms.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          )}
        </section>

        {/* Locations */}
        <section className="dashboard-section">
          <div className="section-header">
            <h3>Location Details</h3>
          </div>
          <div className="form-control">
            <label>Zip Code</label>
            <input name="zip" value={form.zip} onChange={handleChange} onBlur={handleZipLookup} />
          </div>
          <div className="form-control">
            <label>City</label>
            <input name="city" value={form.city} onChange={handleChange} />
          </div>
          <div className="form-control">
            <label>State</label>
            <input name="state" value={form.state} onChange={handleChange} />
          </div>
        </section>

        {/* Media */}
        <section className="dashboard-section">
          <div className="section-header">
            <h3>Profile Media</h3>
          </div>
          <div className="form-control">
            <label>Avatar</label>
            <input type="file" name="avatar_url" accept="image/*" onChange={handleChange} />
          </div>
          <div className="form-control">
            <label>Screenshots</label>
            <input type="file" name="screenshots" accept="image/*" multiple onChange={handleChange} />
          </div>
        </section>

        {/* Visibility */}
        <section className="dashboard-section">
          <div className="section-header">
            <h3>Visibility</h3>
          </div>
          <div className="form-control">
            <label>
              <input type="checkbox" name="is_public" checked={form.is_public} onChange={handleChange} /> Public
            </label>
          </div>
          <button type="submit" className="btn btn-small">{loading ? 'Saving...' : 'Save Person of Interest'}</button>
        </section>
      </form>
    </div>
  );
}
