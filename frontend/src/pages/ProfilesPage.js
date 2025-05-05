// frontend/src/pages/ProfilesPage.js
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import supabase from '../supabaseClient'
import defaultAvatar from '../assets/default-avatar.png'
import '../App.css'

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadProfiles() {
      setLoading(true)
      const { data, error: dbErr } = await supabase
        .from('public_profile_enriched_view')
        .select('poi_id, slug, main_alias, avatar_url, trust_score, city, state')

      if (dbErr) {
        setError(dbErr.message)
        setLoading(false)
        return
      }

      const enriched = await Promise.all(
        data.map(async (p) => {
          let publicUrl = defaultAvatar
          if (p.avatar_url) {
            const { data: urlData, error: urlErr } = supabase
              .storage
              .from('avatars')
              .getPublicUrl(p.avatar_url)
            if (!urlErr && urlData?.publicUrl) publicUrl = urlData.publicUrl
          }
          return { ...p, avatar_url: publicUrl }
        })
      )

      setProfiles(enriched)
      setLoading(false)
    }
    loadProfiles()
  }, [])

  const q = search.toLowerCase()
  const filtered = profiles.filter(p =>
    p.main_alias.toLowerCase().includes(q) ||
    p.slug.toLowerCase().includes(q) ||
    `${p.city}, ${p.state}`.toLowerCase().includes(q)
  )

  if (loading) return <div className="spinner">Loading…</div>
  if (error) return <p className="empty-state">{error}</p>

  return (
    <div className="container">
      <h2>Browse Profiles</h2>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name, slug, or city/state…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="empty-state">No profiles match your search.</p>
      ) : (
        <div className="profiles-grid">
          {filtered.map(p => (
            <Link
              key={p.poi_id}
              to={`/profiles/${p.slug}`}
              className="profile-card"
            >
              <img
                src={p.avatar_url}
                alt={p.main_alias}
                className="profile-avatar"
              />
              <h3>{p.main_alias}</h3>
              <div className="trust-score">
                {'❤️'.repeat(Math.max(0, Math.round(p.trust_score)))}
                <span className="score-number">
                  {(p.trust_score || 0).toFixed(1)}
                </span>
              </div>
              <small className="region">
                {p.city}, {p.state}
              </small>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
