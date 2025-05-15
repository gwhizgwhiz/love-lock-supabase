import { useState, useEffect } from 'react'
import supabase from '../supabaseClient'
import '../App.css'

export default function InteractionsPage() {
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

  const [userId, setUserId] = useState(null)
  const [screenshotFile, setScreenshotFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        console.error('Could not fetch user:', error)
        return
      }
      setUserId(user.id)
      console.log('Authenticated user:', user)
    }
    fetchUser()
  }, [])

  const handleInput = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const toggleInaccuracy = (option) => {
    setForm(prev => ({
      ...prev,
      profile_inaccuracies: prev.profile_inaccuracies.includes(option)
        ? prev.profile_inaccuracies.filter(i => i !== option)
        : [...prev.profile_inaccuracies, option]
    }))
  }

  const handleScreenshotUpload = async () => {
    if (!screenshotFile) return { url: '', verified: false }

    const fileExt = screenshotFile.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `screenshots/${fileName}`

    const { error: uploadError } = await supabase
      .storage
      .from('screenshots')
      .upload(filePath, screenshotFile)

    if (uploadError) {
      console.error('Screenshot upload failed:', uploadError)
      return { url: '', verified: false }
    }

    const { data } = supabase
      .storage
      .from('screenshots')
      .getPublicUrl(filePath)

    return { url: data.publicUrl, verified: true }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    if (!form.real_name || !form.date_of_experience) {
      console.warn('Real name and date are required.')
      setSubmitting(false)
      return
    }

    console.log('🧠 Calling create_or_get_poi for:', form.real_name)
    const { data: poiData, error: poiError } = await supabase.rpc('create_or_get_poi', {
      real_name_used: form.real_name
    })

    if (poiError || !poiData || poiData.length === 0) {
      console.error('Failed to fetch or create POI:', poiError, poiData)
      setSubmitting(false)
      return
    }

    const poiId = poiData[0].id
    console.log('✅ POI resolved:', poiId)

    const { url, verified } = await handleScreenshotUpload()

    const insertPayload = {
      reporter_id: userId,
      poi_id: poiId,
      real_name_used: form.real_name,
      meet_type: form.meet_type,
      platform: form.meet_type === 'online' ? form.platform : null,
      alias: form.meet_type === 'online' ? form.alias : null,
      date_of_experience: form.date_of_experience,
      locations: form.locations,
      profile_match_vote: form.profile_match_vote,
      profile_inaccuracies: form.profile_match_vote === 'inaccurate' ? form.profile_inaccuracies : [],
      what_went_right: form.what_went_right,
      what_went_wrong: form.what_went_wrong,
      screenshot_url: url,
      verified_with_screenshot: verified
    }

    console.log('📤 Inserting experience:', insertPayload)

    const { error } = await supabase.from('person_experiences').insert(insertPayload)

    if (error) {
      console.error('❌ Insert failed:', error)
    } else {
      console.log('✅ Experience logged successfully')
    }

    // Reset
    setForm({
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
    setScreenshotFile(null)
    setSubmitting(false)
  }

  return (
    <div className="container">
      <h2>Log an Interaction</h2>
      <form onSubmit={handleSubmit} className="form">
        <div className="input-group">
          <label>Real name used</label>
          <input className="input-field" name="real_name" value={form.real_name} onChange={handleInput} required />
        </div>

        <div className="input-group">
          <label>How did you meet?</label>
          <div>
            <button type="button" className={`btn-small ${form.meet_type === 'online' ? 'btn' : 'btn-outline'}`} onClick={() => setForm(f => ({ ...f, meet_type: 'online' }))}>Online</button>
            <button type="button" className={`btn-small ${form.meet_type === 'in_person' ? 'btn' : 'btn-outline'}`} onClick={() => setForm(f => ({ ...f, meet_type: 'in_person' }))}>In Person</button>
          </div>
        </div>

        {form.meet_type === 'online' && (
          <>
            <div className="input-group">
              <label>Platform</label>
              <input className="input-field" name="platform" value={form.platform} onChange={handleInput} />
            </div>
            <div className="input-group">
              <label>Profile name (username)</label>
              <input className="input-field" name="alias" value={form.alias} onChange={handleInput} />
            </div>
            <div className="input-group">
              <label>Was their profile accurate?</label>
              <div>
                {['accurate', 'inaccurate', 'unsure'].map(option => (
                  <button key={option} type="button" className={`btn-small ${form.profile_match_vote === option ? 'btn' : 'btn-outline'}`} onClick={() => setForm(f => ({ ...f, profile_match_vote: option }))}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {form.profile_match_vote === 'inaccurate' && (
              <div className="input-group">
                <label>What was inaccurate?</label>
                {['age', 'weight', 'looks', 'height', 'marital_status'].map(option => (
                  <label key={option} style={{ marginRight: '1rem' }}>
                    <input
                      type="checkbox"
                      checked={form.profile_inaccuracies.includes(option)}
                      onChange={() => toggleInaccuracy(option)}
                    />
                    {' '}{option.replace('_', ' ')}
                  </label>
                ))}
              </div>
            )}
          </>
        )}

        <div className="input-group">
          <label>Date of Interaction</label>
          <input className="input-field" type="date" name="date_of_experience" value={form.date_of_experience} onChange={handleInput} required />
        </div>

        <div className="input-group">
          <label>Location(s)</label>
          <textarea className="input-field" name="locations" value={form.locations} onChange={handleInput} placeholder="Where did the date happen?" />
        </div>

        <div className="input-group">
          <label>What went right?</label>
          <textarea className="input-field" name="what_went_right" value={form.what_went_right} onChange={handleInput} />
        </div>

        <div className="input-group">
          <label>What went wrong?</label>
          <textarea className="input-field" name="what_went_wrong" value={form.what_went_wrong} onChange={handleInput} />
        </div>

        <div className="input-group">
          <label>Upload a screenshot of their profile (optional)</label>
          <input type="file" onChange={(e) => setScreenshotFile(e.target.files[0])} />
        </div>

        <button type="submit" className="btn" disabled={submitting}>
          Submit Interaction
        </button>
      </form>
    </div>
  )
}
