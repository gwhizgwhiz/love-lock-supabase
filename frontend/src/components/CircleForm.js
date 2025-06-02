// src/components/CircleForm.jsx
import React, { useState } from 'react';
import { CircleService } from '../lib/circles';

export default function CircleForm({ onCreated }) {
  const [form, setForm] = useState({
    name: '', state: '', city: '', zipcode: '', type: 'public', icon: '🌟'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    const { error } = await CircleService.createCircle(form);
    setLoading(false);
    if (error) setError(error);
    else {
      setError(null);
      setForm({ name:'', state:'', city:'', zipcode:'', type:'public', icon:'🌟' });
      onCreated();
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
      {error && <p style={{ color:'red' }}>{error.message}</p>}
      <input
        name="name" placeholder="Circle Name"
        value={form.name} onChange={handleChange} required
      />
      <input
        name="state" placeholder="State"
        value={form.state} onChange={handleChange} required
      />
      <input
        name="city" placeholder="City"
        value={form.city} onChange={handleChange} required
      />
      <input
        name="zipcode" placeholder="Zip Code"
        type="text" pattern="\d{5}" title="Must be a valid 5-digit zip code"
        value={form.zipcode} onChange={handleChange} required
      />
      <select name="type" value={form.type} onChange={handleChange}>
        <option value="public">Public</option>
        <option value="request">Request Only</option>
        <option value="invite">Invite Only</option>
      </select>
      <input
        name="icon" placeholder="Icon (emoji or URL)"
        value={form.icon} onChange={handleChange}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating…' : 'Create Circle'}
      </button>
    </form>
  );
}
