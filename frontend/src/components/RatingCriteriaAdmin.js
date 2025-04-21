import React, { useEffect, useState } from 'react';
import supabase from '../supabaseClient';

export default function RatingCriteriaAdmin() {
  const [criteria, setCriteria] = useState([]);
  const [form, setForm] = useState({ interaction_type: '', name: '', weight: 1 });
  const [editing, setEditing] = useState(null);

  const fetchCriteria = async () => {
    const { data, error } = await supabase
      .from('rating_criteria')
      .select('*')
      .order('interaction_type', { ascending: true });
    if (!error) setCriteria(data);
  };

  useEffect(() => {
    fetchCriteria();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let res;
    if (editing) {
      res = await supabase
        .from('rating_criteria')
        .update({ name: form.name, weight: parseFloat(form.weight) })
        .eq('id', editing);
    } else {
      res = await supabase.from('rating_criteria').insert([form]);
    }
    if (!res.error) {
      fetchCriteria();
      setForm({ interaction_type: '', name: '', weight: 1 });
      setEditing(null);
    }
  };

  const startEdit = (item) => {
    setEditing(item.id);
    setForm({ interaction_type: item.interaction_type, name: item.name, weight: item.weight });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this criterion?')) {
      await supabase.from('rating_criteria').delete().eq('id', id);
      fetchCriteria();
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">Rating Criteria Admin</h2>
      <form onSubmit={handleSubmit} className="mb-4 flex flex-wrap gap-2">
        <select
          name="interaction_type"
          value={form.interaction_type}
          onChange={handleChange}
          required
          className="p-2 border rounded"
        >
          <option value="">Select type</option>
          {['date','phone_call','text_message','email','video_call','in_person','other'].map((type) => (
            <option key={type} value={type}>{type.replace('_',' ')}</option>
          ))}
        </select>
        <input
          name="name"
          placeholder="Criterion name"
          value={form.name}
          onChange={handleChange}
          required
          className="p-2 border rounded"
        />
        <input
          name="weight"
          type="number"
          step="0.1"
          value={form.weight}
          onChange={handleChange}
          required
          className="p-2 border rounded w-20"
        />
        <button type="submit" className="p-2 bg-blue-500 text-white rounded">
          {editing ? 'Update' : 'Add'}
        </button>
        {editing && (
          <button
            type="button"
            onClick={() => { setEditing(null); setForm({ interaction_type: '', name: '', weight: 1 }); }}
            className="p-2 border rounded"
          >
            Cancel
          </button>
        )}
      </form>

      <table className="w-full border-collapse border">
        <thead>
          <tr>
            <th className="border px-2 py-1">Type</th>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Weight</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {criteria.map((item) => (
            <tr key={item.id}>
              <td className="border px-2 py-1">{item.interaction_type.replace('_',' ')}</td>
              <td className="border px-2 py-1">{item.name}</td>
              <td className="border px-2 py-1">{item.weight}</td>
              <td className="border px-2 py-1 space-x-2">
                <button onClick={() => startEdit(item)} className="text-blue-600">Edit</button>
                <button onClick={() => handleDelete(item.id)} className="text-red-600">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
