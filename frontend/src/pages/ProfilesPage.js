// frontend/src/pages/ProfilesPage.js
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import supabase from '../supabaseClient'
import defaultAvatar from '../assets/default-avatar.png'
import '../App.css'

export default function ProfilesPage() {
  const [profiles, setProfiles]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [search, setSearch]         = useState('')
  const [showPublic, setShowPublic] = useState(false)
  const [userId, setUserId]         = useState(null)
  const [filterUserProfiles, setFilterUserProfiles] = useState(false);


  // 1. Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (user && !error) setUserId(user.id)
    }
    getUser()
  }, [])

  // 2. Load all profiles, then filter client-side
  useEffect(() => {
    const loadProfiles = async () => {
      setLoading(true)
      const { data, error: dbErr } = await supabase
        .from('public_profile_view')
        .select(`
          id,
          created_by,
          slug,
          main_alias,
          trust_score,
          city,
          state,
          trust_badge,
          avatar_url,
          is_shareable,
          visibility
        `)

      if (dbErr) {
        setError(dbErr.message)
        setLoading(false)
        return
      }

      const enriched = await Promise.all(data.map(async p => {
        let avatar = defaultAvatar
        if (p.avatar_url) {
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(p.avatar_url)
          if (urlData?.publicUrl) avatar = urlData.publicUrl
        }
        return { ...p, avatar_url: avatar }
      }))

      setProfiles(enriched)
      setLoading(false)
    }

    loadProfiles()
  }, [])

  // 3. Filter by toggle and search
  const q = search.toLowerCase()
  const displayed = profiles.filter(p => {
  if (!p) return false

  // Not logged in — only show public/shareable
  if (!userId) return p.is_shareable || p.visibility === 'public'

  if (filterUserProfiles && !p.is_user_profile) return false;
  // Logged in — toggle determines filter
  return showPublic
    ? p.is_shareable || p.visibility === 'public'
    : p.created_by === userId
})

  const filtered = displayed.filter(p =>
    p.main_alias?.toLowerCase().includes(q) ||
    p.slug?.toLowerCase().includes(q) ||
    `${p.city || ''}, ${p.state || ''}`.toLowerCase().includes(q)
  )

  if (loading) return <div className="spinner">Loading…</div>
  if (error) return <p className="empty-state">{error}</p>

  return (
    <div className="container">
      <h2>Browse Profiles</h2>

      <div className="controls" style={{ marginBottom: '1rem' }}>
        
        {userId && (<label>
          <input
            type="checkbox"
            checked={showPublic}
            onChange={() => setShowPublic(prev => !prev)}
          />{' '}
          Show public profiles
        </label> )}
        {userId && (<label style={{ marginLeft: '1rem' }}>
          <input
            type="checkbox"
            checked={filterUserProfiles}
            onChange={() => setFilterUserProfiles(prev => !prev)}
          />{' '}
          Show only registered user profiles
        </label> )}
        <input
          className="search-input"
          type="text"
          placeholder="Search by name, slug, or city/state…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginLeft: '1rem' }}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="empty-state">No profiles match your search.</p>
      ) : (
        <div className="profiles-grid">
          {filtered.map(p => (
            <Link
              key={p.id}
              to={`/profile/${p.slug}`}
              className="profile-card"
            >
              <img
                src={p.avatar_url}
                alt={p.main_alias}
                className="profile-avatar"
              />
              <h3>
                {p.main_alias}
                {p.is_user_profile && p.created_by === userId && (
                  <span className="badge">This is you</span>
                )}
              </h3>
              <div className="trust-score">
                {'❤️'.repeat(Math.max(0, Math.min(5, Math.round(p.trust_score || 0))))}
                <span className="score-number">
                  {(p.trust_score || 0).toFixed(1)}
                </span>
              </div>
              <small className="region">
                {p.city || '—'}, {p.state || ''}
              </small>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
