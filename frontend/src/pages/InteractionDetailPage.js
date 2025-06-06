// src/pages/InteractionDetailPage.jsx

import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import supabase from '../supabaseClient';
import '../App.css';

export default function InteractionDetailPage() {
  const { id } = useParams();
  const [interaction, setInteraction] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInteraction = async () => {
      const { data, error } = await supabase
        .from('interactions')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        setError('Interaction not found.');
      } else {
        setInteraction(data);
      }
    };

    fetchInteraction();
  }, [id]);

  if (error) return <div className="container"><p className="error">{error}</p></div>;
  if (!interaction) return <div className="container"><p>Loading interaction...</p></div>;

  return (
    <div className="container">
      <h2 className="dashboard-heading">Interaction Report</h2>
      <div className="interaction-detail">
        <p><strong>Date:</strong> {new Date(interaction.date_of_experience).toLocaleDateString()}</p>
        <p><strong>Alias:</strong> {interaction.alias || '—'}</p>
        <p><strong>Meet Type:</strong> {interaction.meet_type || '—'}</p>
        <p><strong>Platform:</strong> {interaction.platform || '—'}</p>
        <p><strong>Location(s):</strong> {interaction.locations || '—'}</p>
        <p><strong>Match Vote:</strong> {interaction.profile_match_vote || '—'}</p>
        {interaction.profile_inaccuracies?.length > 0 && (
          <p><strong>Inaccuracies:</strong> {interaction.profile_inaccuracies.join(', ')}</p>
        )}
        <p><strong>What Went Right:</strong> {interaction.what_went_right || '—'}</p>
        <p><strong>What Went Wrong:</strong> {interaction.what_went_wrong || '—'}</p>
        {interaction.screenshot_url && (
          <p><strong>Screenshot:</strong>{' '}
            <a href={interaction.screenshot_url} target="_blank" rel="noreferrer">View</a>
          </p>
        )}
      </div>
      <Link to={-1} className="btn btn-small">← Back</Link>
    </div>
  );
}
