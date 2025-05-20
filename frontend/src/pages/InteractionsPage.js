// InteractionsPage.jsx
import { useState, useEffect } from 'react'
import Select from 'react-select'
import supabase from '../supabaseClient'
import defaultAvatar from '../assets/default-avatar.png'
import '../App.css'

export default function InteractionsPage() {
  const [userId, setUserId] = useState(null)
  const [poiOptions, setPoiOptions] = useState([])
  const [selectedPoi, setSelectedPoi] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    real_name: '',
    meet_type: '',
    platform: '',
    alias: '',
    date_of_experience: '',
    locations: '',
    profile_match_vote: '',
    profile_inaccuracies: [],
    what_went_right: '',
    what_went_wrong: '',
    screenshot_url: '',
    verified_with_screenshot: false
  })

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (user && !error) {
        setUserId(user.id)
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchInput || !userId) return

      const { data, error } = await supabase
        .from('public_profile_view')
        .select('id, main_alias, platform, avatar_url, city, state, trust_score')
        .ilike('main_alias', `%${searchInput}%`)

      if (!error && data) {
        const enriched = data.map(p => ({
          value: p.id,
          label: p.main_alias,
          data: p
        }))
        setPoiOptions(enriched)
      } else if (error) {
        console.error('Failed to load POI options:', error)
      }
    }

    fetchSuggestions()
  }, [searchInput, userId])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handlePoiChange = (selected) => {
    setSelectedPoi(selected)
    if (selected && selected.data) {
      const { main_alias, platform } = selected.data
      setForm(prev => ({ ...prev, alias: main_alias, platform }))
    }
  }

  const CustomOption = (props) => {
  const { data, innerRef, innerProps } = props
  const poi = data.data
  const avatar = poi?.avatar_url
    ? supabase.storage.from('avatars').getPublicUrl(poi.avatar_url).data.publicUrl
    : defaultAvatar

  return (
    <div ref={innerRef} {...innerProps} className="select-option">
      <img src={avatar} alt={poi.main_alias} className="avatar-thumb" />
      <div className="select-info">
        <div className="alias">{poi.main_alias} <small>({poi.platform})</small></div>
        <div className="location">{poi.city || '–'}, {poi.state || ''}</div>
        <div className="trust">❤️ {poi.trust_score ?? 0}</div>
      </div>
    </div>
  )
}


  return (
    <div className="container">
      <h2>Log an Interaction</h2>

      <div className="input-group">
        <label>Search for a person</label>
        <Select
          options={poiOptions}
          onInputChange={val => setSearchInput(val)}
          onChange={handlePoiChange}
          getOptionLabel={e => e.label}
          components={{ Option: CustomOption }}
          placeholder="Start typing a name or..."
          isClearable
        />
      </div>

      {/* You can continue your form fields here */}
    </div>
  )
}
