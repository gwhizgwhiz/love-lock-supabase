// src/pages/RateDatePage.jsx
import { useState, useEffect, useCallback } from 'react'
import supabase from '../supabaseClient'
import '../App.css'

export default function RateDatePage() {
  const [aliasInput, setAliasInput] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [selectedAlias, setSelectedAlias] = useState(null)
  const [manualEntry, setManualEntry] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const [selectedPOI, setSelectedPOI] = useState(null)
  const [profiles, setProfiles] = useState([])
  const [selectedProfileId, setSelectedProfileId] = useState(null)
  const [rating, setRating] = useState(5)
  const [type, setType] = useState('good')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [dateOfExperience, setDateOfExperience] = useState('')
  const [profileMatchVote, setProfileMatchVote] = useState('accurate')
  const [whatWentRight, setWhatWentRight] = useState('')
  const [whatWentWrong, setWhatWentWrong] = useState('')
  const [screenshotFile, setScreenshotFile] = useState(null)
  const [screenshotUrl, setScreenshotUrl] = useState('')
  const [verifiedWithScreenshot, setVerifiedWithScreenshot] = useState(false)

  const [userExperiences, setUserExperiences] = useState([])

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('person_experiences')
        .select(`id, created_at, rating, type, notes, person_of_interest (main_alias), poi_profiles (alias, platform)`)
        .eq('reporter_id', user.id)
        .order('created_at', { ascending: false })

      if (!error) setUserExperiences(data)
    }
    fetchUser()
  }, [submitted])

  const debouncedSearch = useCallback(debounce(async (value) => {
    if (!value.trim()) return setSuggestions([])

    const { data, error } = await supabase
      .from('poi_profiles')
      .select('id, alias, poi_id')
      .ilike('alias', `%${value}%`)

    if (!error) setSuggestions(data)
  }, 300), [])

  function handleAliasChange(e) {
    const value = e.target.value
    setAliasInput(value)
    setShowSuggestions(true)
    setManualEntry(false)
    debouncedSearch(value)
  }

  function handleAliasSelect(profile) {
    setAliasInput(profile.alias)
    setSelectedAlias(profile)
    setShowSuggestions(false)
    selectPOI(profile.poi_id)
  }

  function handleManualProceed() {
    setManualEntry(true)
    setShowSuggestions(false)
    createPOIAndProfile(aliasInput)
  }

  async function selectPOI(poi_id) {
    const { data: poi, error } = await supabase
      .from('person_of_interest')
      .select('*')
      .eq('id', poi_id)
      .single()

    setSelectedPOI(poi)

    const { data: profilesData } = await supabase
      .from('poi_profiles')
      .select('*')
      .eq('poi_id', poi_id)

    setProfiles(profilesData || [])
  }

  async function createPOIAndProfile(aliasValue) {
    const { data: poi, error: poiError } = await supabase
      .from('person_of_interest')
      .insert([{ main_alias: aliasValue, is_cringe: true }])
      .select()
      .single()

    if (poiError) return console.error(poiError)

    const { data: profile, error: profileError } = await supabase
      .from('poi_profiles')
      .insert([{ poi_id: poi.id, alias: aliasValue, platform: 'Unknown', is_cringe: true }])
      .select()
      .single()

    if (profileError) return console.error(profileError)

    setSelectedPOI(poi)
    setProfiles([profile])
    setSelectedProfileId(profile.id)
  }

  async function handleScreenshotUpload() {
    if (!screenshotFile) return null
    const ext = screenshotFile.name.split('.').pop()
    const path = `screenshots/${Date.now()}.${ext}`

    const { error } = await supabase.storage.from('screenshots').upload(path, screenshotFile)
    if (error) return null

    const { data } = supabase.storage.from('screenshots').getPublicUrl(path)
    return data?.publicUrl
  }

  async function submitExperience() {
    if (!selectedPOI || !selectedProfileId) return
    setLoading(true)

    const screenshot = await handleScreenshotUpload()

    const { error } = await supabase.from('person_experiences').insert({
      poi_id: selectedPOI.id,
      profile_id: selectedProfileId,
      rating,
      type,
      notes,
      date_of_experience: dateOfExperience,
      profile_match_vote: profileMatchVote,
      what_went_right: whatWentRight,
      what_went_wrong: whatWentWrong,
      screenshot_url: screenshot,
      verified_with_screenshot: !!screenshot
    })

    if (!error) {
      setAliasInput('')
      setSelectedAlias(null)
      setManualEntry(false)
      setSelectedPOI(null)
      setProfiles([])
      setSelectedProfileId(null)
      setRating(5)
      setType('good')
      setNotes('')
      setDateOfExperience('')
      setProfileMatchVote('accurate')
      setWhatWentRight('')
      setWhatWentWrong('')
      setScreenshotFile(null)
      setVerifiedWithScreenshot(false)
      setSubmitted(true)
    }

    setLoading(false)
  }

  return (
    <div className="container">
      <h1 className="mb-2">Rate a Date</h1>

      {!selectedPOI && (
        <div className="input-group invite-control">
          <label>Search or Enter Alias:</label>
          <input
            type="text"
            className="invite-input"
            value={aliasInput}
            onChange={handleAliasChange}
            onFocus={() => setShowSuggestions(true)}
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="invite-suggestions">
              {suggestions.map((s) => (
                <li
                  key={s.id}
                  className="invite-suggestion-item"
                  onClick={() => handleAliasSelect(s)}
                >
                  {s.alias}
                </li>
              ))}
            </ul>
          )}
          {showSuggestions && suggestions.length === 0 && (
            <button className="btn-outline" onClick={handleManualProceed}>Create Profile for “{aliasInput}”</button>
          )}
        </div>
      )}

      {selectedPOI && (
        <div className="form">
          <div className="input-group">
            <label>Date of experience:</label>
            <input type="date" className="input-field" value={dateOfExperience} onChange={(e) => setDateOfExperience(e.target.value)} />
          </div>

          <div className="input-group">
            <label>Was their profile accurate?</label>
            <label><input type="radio" value="accurate" checked={profileMatchVote === 'accurate'} onChange={() => setProfileMatchVote('accurate')} /> Yes</label>
            <label><input type="radio" value="inaccurate" checked={profileMatchVote === 'inaccurate'} onChange={() => setProfileMatchVote('inaccurate')} /> No</label>
            <label><input type="radio" value="unsure" checked={profileMatchVote === 'unsure'} onChange={() => setProfileMatchVote('unsure')} /> Not Sure</label>
          </div>

          <div className="input-group">
            <label>What went right:</label>
            <textarea className="input-field" value={whatWentRight} onChange={(e) => setWhatWentRight(e.target.value)} />
          </div>

          <div className="input-group">
            <label>What went wrong:</label>
            <textarea className="input-field" value={whatWentWrong} onChange={(e) => setWhatWentWrong(e.target.value)} />
          </div>

          <div className="input-group">
            <label>Rating (1–5):</label>
            <input type="number" min="1" max="5" className="input-field" value={rating} onChange={(e) => setRating(Number(e.target.value))} />
          </div>

          <div className="input-group">
            <label>Upload screenshot of dating profile:</label>
            <input type="file" accept="image/*" onChange={(e) => setScreenshotFile(e.target.files[0])} />
          </div>

          <button className="btn" onClick={submitExperience} disabled={loading || !selectedProfileId}>Submit</button>
        </div>
      )}
    </div>
  )
}

function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
