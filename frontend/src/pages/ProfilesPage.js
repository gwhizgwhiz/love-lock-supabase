// src/pages/ProfilesPage.js
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import supabase from '../supabaseClient'
import defaultAvatar from '../assets/default-avatar.png'
import '../App.css'

export default function ProfilesPage() {
  const [pois, setPois] = useState([])
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [showProfiles, setShowProfiles] = useState(false)

  // Fetch Persons of Interest and public profiles on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        // Load POIs
        const { data: poiData, error: poiErr } = await supabase
          .from('person_of_interest')
          .select('id, main_alias')
        if (poiErr) throw poiErr
        setPois(
          poiData.map(p => ({ id: p.id, name: p.main_alias, avatar_url: defaultAvatar }))
        )

        // Load public user profiles
        const { data: profData, error: profErr } = await supabase
          .from('profiles')
          .select('id, name, avatar_url, trust_score, city, state')
          .eq('is_public', true)
        if (profErr) throw profErr
        setProfiles(
          profData.map(p => ({
            id: p.id,
            name: p.name || 'Unnamed',
            avatar_url: p.avatar_url || defaultAvatar,
            trust_score: p.trust_score,
            city: p.city,
            state: p.state
          }))
        )
      } catch (err) {
        console.error('Error loading data:', err)
        setError(err.message || 'Could not load Browse data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Filter lists
  const term = search.trim().toLowerCase()
  const filteredPois = pois.filter(p => p.name.toLowerCase().includes(term))
  const filteredProfiles = profiles.filter(p =>
    p.name.toLowerCase().includes(term) ||
    `${p.city || ''}, ${p.state || ''}`.toLowerCase().includes(term)
  )

  if (loading) return <div className="spinner">Loading…</div>
  if (error) return <p className="empty-state">{error}</p>

  return (
    <div className="container">
      <h2>Persons of Interest</h2>

      <div className="controls" style={{ marginBottom: '1rem' }}>
        <label>
          <input
            type="checkbox"
            checked={showProfiles}
            onChange={() => setShowProfiles(prev => !prev)}
          />{' '}
          Show Public User Profiles
        </label>
        <input
          className="search-input"
          type="text"
          placeholder="Search by name, city, or state…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginLeft: '1rem' }}
        />
      </div>

      {filteredPois.length === 0 ? (
        <p className="empty-state">No persons of interest found.</p>
      ) : (
        <div className="profiles-grid">
          {filteredPois.map(poi => (
            <Link key={poi.id} to={`/persons/${poi.id}`} className="profile-card">
              <img src={poi.avatar_url} alt={poi.name} className="profile-avatar" />
              <h3>{poi.name}</h3>
            </Link>
          ))}
        </div>
      )}

      {showProfiles && (
        <section style={{ marginTop: '2rem' }}>
          <h2>Public User Profiles</h2>
          {filteredProfiles.length === 0 ? (
            <p className="empty-state">No public profiles found.</p>
          ) : (
            <div className="profiles-grid">
              {filteredProfiles.map(user => (
                <Link key={user.id} to={`/profiles/${user.id}`} className="profile-card">
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="profile-avatar"
                  />
                  <h3>{user.name}</h3>
                  <div className="trust-score">
                    {'❤️'.repeat(
                      Math.max(0, Math.min(5, Math.round(user.trust_score || 0)))
                    )}
                    <span className="score-number">
                      {(user.trust_score || 0).toFixed(1)}
                    </span>
                  </div>
                  <small className="region">
                    {user.city || '—'}, {user.state || ''}
                  </small>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
