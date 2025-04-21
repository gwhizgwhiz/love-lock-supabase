// src/components/AddExperience.js
import React, { useEffect, useState } from 'react';
import supabase from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function AddExperience() {
  const [criteria, setCriteria] = useState([]);
  const [form, setForm] = useState({
    person_id: '',
    interaction_type: '',
    platform: '',
    occurred_at: new Date().toISOString(),
    description: '',
    outcome_rating: 'positive',
    ratings: {}
  });
  const navigate = useNavigate();

  // Load all criteria
  useEffect(() => {
    supabase
      .from('rating_criteria')
      .select('*')
      .order('interaction_type', { ascending: true })
      .then(({ data, error }) => {
        if (error) return console.error(error);
        setCriteria(data);
      });
  }, []);

  // Handle generic field changes
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // Handle per-criterion rating
  const handleRating = (id, value) => {
    setForm(f => ({
      ...f,
      ratings: { ...f.ratings, [id]: value }
    }));
  };

  // Submit handler
  const handleSubmit = async e => {
    e.preventDefault();

    // 1) Insert the interaction
    const { data: interaction, error: iErr } = await supabase
      .rpc('log_interaction', {
        _person_id: form.person_id,
        _interaction_type: form.interaction_type,
        _platform: form.platform,
        _occurred_at: form.occurred_at,
        _description: form.description,
        _outcome_rating: form.outcome_rating
      });
    if (iErr) return alert(iErr.message);

    // 2) Insert the ratings
    const ratingsArr = Object.entries(form.ratings).map(
      ([criteria_id, score]) => ({
        interaction_id: interaction.id,
        criteria_id,
        score: Number(score)
      })
    );
    const { error: rErr } = await supabase
      .from('interaction_ratings')
      .insert(ratingsArr);
    if (rErr) return alert(rErr.message);

    // 3) Navigate back
    navigate('/');
  };

  // Filter criteria by selected type
  const filtered = criteria.filter(c => c.interaction_type === form.interaction_type);

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">Log an Experience</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Person ID</label>
          <input
            name="person_id"
            value={form.person_id}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label>Type</label>
          <select
            name="interaction_type"
            value={form.interaction_type}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          >
            <option value="">Select type</option>
            {[...new Set(criteria.map(c => c.interaction_type))].map(type => (
              <option key={type} value={type}>
                {type.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
        {filtered.map(c => (
          <div key={c.id}>
            <label>{c.name} ({c.weight}×)</label>
            <input
              type="number"
              min="0"
              max="5"
              step="1"
              onChange={e => handleRating(c.id, e.target.value)}
              required
              className="w-full border p-2 rounded"
            />
          </div>
        ))}
        <div>
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
