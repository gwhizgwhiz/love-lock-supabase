// src/components/TagSelector.jsx
import { useEffect, useState } from 'react';
import supabase from '../supabaseClient';
import '../App.css';

export default function TagSelector({ poiId, userId }) {
  const [selectedTag, setSelectedTag] = useState(null);
  const [assignmentId, setAssignmentId] = useState(null);
  const [allTags, setAllTags] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!poiId || !userId) return;

    const fetchTags = async () => {
      const { data: tagsData, error: tagErr } = await supabase
        .from('tags')
        .select('id, name, category, emoji, trust_impact_score')
        .eq('is_active', true)
        .order('name');

      if (!tagErr) setAllTags(tagsData);

      const { data: currentAssignment } = await supabase
        .from('poi_tag_assignments')
        .select('id, tag_id, tags(name, emoji)')
        .eq('poi_id', poiId)
        .eq('user_id', userId)
        .maybeSingle();

      if (currentAssignment) {
        setSelectedTag(currentAssignment.tags);
        setAssignmentId(currentAssignment.id);
      }
    };

    fetchTags();
  }, [poiId, userId]);

  const handleTagSelect = async (tag) => {
    if (!poiId || !userId) return;

    if (assignmentId) {
      const { error } = await supabase
        .from('poi_tag_assignments')
        .update({ tag_id: tag.id })
        .eq('id', assignmentId);

      if (!error) setSelectedTag(tag);
    } else {
      const { data, error } = await supabase
        .from('poi_tag_assignments')
        .insert({ tag_id: tag.id, user_id: userId, poi_id: poiId })
        .select('id')
        .single();

      if (!error && data) {
        setAssignmentId(data.id);
        setSelectedTag(tag);
      }
    }
    setShowModal(false);
  };

  const handleClear = async () => {
    if (!assignmentId) return;

    const { error } = await supabase
      .from('poi_tag_assignments')
      .delete()
      .eq('id', assignmentId);

    if (!error) {
      setSelectedTag(null);
      setAssignmentId(null);
    }
  };

  const groupedTags = allTags.reduce((acc, tag) => {
    acc[tag.category] = acc[tag.category] || [];
    acc[tag.category].push(tag);
    return acc;
  }, {});

  return (
    <div className="tag-selector">
      {selectedTag ? (
        <p>
          You tagged this person as: <strong>{selectedTag.emoji} {selectedTag.name}</strong>
        </p>
      ) : (
        <p>No tag assigned.</p>
      )}

      <div className="tag-selector-actions">
        <button className="btn-small" onClick={() => setShowModal(true)}>
          {selectedTag ? 'Change Tag' : 'Assign Tag'}
        </button>
        {selectedTag && (
          <button className="btn-small btn-outline" onClick={handleClear}>Clear</button>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Select a Tag</h3>
            {['positive', 'neutral', 'negative'].map(category => (
              groupedTags[category]?.length > 0 && (
                <div key={category} className={`tag-group ${category}`}>
                  <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                  <div className="tag-grid">
                    {groupedTags[category].map(tag => (
                      <button
                        key={tag.id}
                        className="tag-option"
                        onClick={() => handleTagSelect(tag)}
                      >
                        {tag.emoji} {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )
            ))}
            <button className="btn" onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}