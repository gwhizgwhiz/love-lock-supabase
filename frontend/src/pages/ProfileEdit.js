import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../supabaseClient'
import useCurrentUser from '../hooks/useCurrentUser'
import defaultAvatar from '../assets/default-avatar.png'
import '../App.css'

export default function ProfileEdit() {
  const {
    userId,
    profile,
    avatarUrl: initialAvatarUrl,
    loading: authLoading,
    error: authError
  } = useCurrentUser()
  const navigate = useNavigate()

  // Form state
  const [name, setName] = useState('')
  const [gender, setGender] = useState('')
  const [preference, setPreference] = useState('')
  const [age, setAge] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')

  // Avatar upload state
  const [avatarKey, setAvatarKey] = useState('')
  const [avatarPreview, setAvatarPreview] = useState(defaultAvatar)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (authLoading) return

    if (profile) {
      setName(profile.name || '')
      setGender(profile.gender_identity || '')
      setPreference(profile.dating_preference || '')
      setAge(profile.age?.toString() || '')
      setCity(profile.city || '')
      setState(profile.state || '')
      setZip(profile.zip || profile.zipcode || '')

      setAvatarKey(profile.avatar_url || '')
      setAvatarPreview(initialAvatarUrl || defaultAvatar)
    }
  }, [authLoading, profile, initialAvatarUrl])

  const handleFileChange = async e => {
    const file = e.target.files[0]
    if (!file) return

    setAvatarPreview(URL.createObjectURL(file))

    const ext = file.name.split('.').pop()
    const key = `${userId}-${Date.now()}.${ext}`;  
    const { error: upErr } = await supabase
      .storage
      .from('avatars')
      .upload(key, file, { upsert: true })
    if (upErr) {
      setError(upErr.message)
      return
    }
    setAvatarKey(key)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const updates = {
        user_id: userId,
        name: name.trim(),
        gender_identity: gender,
        dating_preference: preference,
        age: age === '' ? null : parseInt(age, 10),
        city,
        state,
        zip,
        avatar_url: avatarKey || null,
        is_public: true // Optional: set profiles as public
      }

      let error

      if (profile) {
        // Update existing profile
        const { error: updateErr } = await supabase
          .from('profiles')
          .update(updates)
          .eq('user_id', userId)
        error = updateErr
      } else {
        // Create new profile
        const { error: insertErr } = await supabase
          .from('profiles')
          .insert(updates)
        error = insertErr
      }

      if (error) throw error

      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (authLoading) return <div className="spinner">Loading…</div>
  if (authError) return <p className="error-message">{authError}</p>

  return (
    <div className="container profile-edit-container">
      <h2>{profile ? 'Edit Your Profile' : 'Create Your Profile'}</h2>
      {error && <p className="error-message">{error}</p>}

      <form className="form" onSubmit={handleSubmit}>
        <label>
          Display Name
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </label>

        <label>
          Gender Identity
          <select
            value={gender}
            onChange={e => setGender(e.target.value)}
            required
          >
            <option value="">Select gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Non-binary</option>
            <option>Prefer not to say</option>
            <option>Other</option>
          </select>
        </label>

        <label>
          Dating Preference
          <select
            value={preference}
            onChange={e => setPreference(e.target.value)}
          >
            <option value="">Select preference</option>
            <option>Men</option>
            <option>Women</option>
            <option>Non-binary</option>
            <option>Everyone</option>
            <option>Prefer not to say</option>
            <option>Other</option>
          </select>
        </label>

        <label>
          Age
          <input
            type="number"
            min="18"
            max="120"
            value={age}
            onChange={e => setAge(e.target.value)}
          />
        </label>

        <label>
          City
          <input
            type="text"
            value={city}
            onChange={e => setCity(e.target.value)}
          />
        </label>

        <label>
          State
          <input
            type="text"
            value={state}
            onChange={e => setState(e.target.value)}
          />
        </label>

        <label>
          Zip Code
          <input
            type="text"
            value={zip}
            onChange={e => setZip(e.target.value)}
          />
        </label>

        <label>
          Avatar
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
        <img
          src={avatarPreview}
          alt="Avatar preview"
          className="avatar-preview"
        />

        <button
          type="submit"
          className="btn btn-primary"
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}
