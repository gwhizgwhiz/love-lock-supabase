import { useState } from 'react'
import supabase from '../supabaseClient'

export default function RateDateModal({ onClose }) {
  const [alias, setAlias] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedPOI, setSelectedPOI] = useState(null)
  const [profiles, setProfiles] = useState([])
  const [selectedProfileId, setSelectedProfileId] = useState(null)
  const [rating, setRating] = useState(5)
  const [type, setType] = useState('good')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  async function searchPOIs() {
    const { data, error } = await supabase
      .from('person_of_interest')
      .select('id, main_alias')
      .ilike('main_alias', `%${alias}%`)

    if (!error) setSearchResults(data)
  }

  async function selectPOI(poi) {
    setSelectedPOI(poi)

    const { data, error } = await supabase
      .from('poi_profiles')
      .select('id, alias, platform, is_cringe')
      .eq('poi_id', poi.id)

    if (!error) setProfiles(data)
  }

  async function createNewPOI() {
    // For MVP, assume this triggers a separate profile creation flow
    alert('No match found. Please create a new profile manually.')
  }

  async function submitExperience() {
    if (!selectedPOI || !selectedProfileId) return

    setLoading(true)

    const { error } = await supabase.from('person_experiences').insert({
      poi_id: selectedPOI.id,
      profile_id: selectedProfileId,
      rating,
      type,
      notes
    })

    setLoading(false)

    if (!error) {
      alert('Thanks for logging your experience!')
      onClose()
    } else {
      console.error('Error submitting experience:', error)
    }
  }

  return (
    <div className="modal">
      <h2>Rate a Date</h2>

      {!selectedPOI && (
        <>
          <input
            type="text"
            placeholder="Search by alias..."
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            onBlur={searchPOIs}
          />
          <ul>
            {searchResults.map((poi) => (
              <li key={poi.id} onClick={() => selectPOI(poi)}>
                {poi.main_alias}
              </li>
            ))}
          </ul>
          <button onClick={createNewPOI}>Add New Profile</button>
        </>
      )}

      {selectedPOI && (
        <>
          <h3>Which profile did you interact with?</h3>
          <ul>
            {profiles.map((p) => (
              <li key={p.id}>
                <label>
                  <input
                    type="radio"
                    value={p.id}
                    checked={selectedProfileId === p.id}
                    onChange={() => setSelectedProfileId(p.id)}
                  />
                  {p.alias} ({p.platform}) {p.is_cringe ? '🚩' : '✅'}
                </label>
              </li>
            ))}
          </ul>

          <label>
            <input
              type="radio"
              value="good"
              checked={type === 'good'}
              onChange={() => setType('good')}
            /> Good
          </label>
          <label>
            <input
              type="radio"
              value="bad"
              checked={type === 'bad'}
              onChange={() => setType('bad')}
            /> Bad
          </label>

          <label>Rating (1–5):</label>
          <input
            type="number"
            min="1"
            max="5"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          />

          <textarea
            placeholder="Tell us more (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <button onClick={submitExperience} disabled={loading || !selectedProfileId}>
            Submit
          </button>
        </>
      )}

      <button onClick={onClose}>Close</button>
    </div>
  )
}
