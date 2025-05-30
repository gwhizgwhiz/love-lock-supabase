import { useState, useEffect } from 'react'
import supabase from '../supabaseClient'
import defaultAvatar from '../assets/default-avatar.png'

export default function OnboardingModal({ userId, onComplete }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    gender: '',
    zipcode: '',
    city: '',
    state: '',
    preferences: '',
    avatar: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch city/state when zipcode changes
  useEffect(() => {
    const fetchCityState = async () => {
      if (formData.zipcode.length === 5) {
        const { data, error } = await supabase
          .from('zipcodes')
          .select('city, state')
          .eq('zipcode', formData.zipcode)
          .single()
        if (data) {
          setFormData(prev => ({ ...prev, city: data.city, state: data.state }))
        } else {
          setFormData(prev => ({ ...prev, city: '', state: '' }))
        }
      }
    }
    fetchCityState()
  }, [formData.zipcode])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      first_name: formData.first_name,
      last_name: formData.last_name,
      gender: formData.gender,
      zipcode: formData.zipcode,
      preferences: formData.preferences,
      avatar: formData.avatar || defaultAvatar
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      onComplete() // Close modal & continue app flow
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Let's Get Started</h2>

        {step === 1 && (
          <>
            <label className="block mb-2">
              First Name
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="w-full p-2 border rounded" />
            </label>
            <label className="block mb-2">
              Last Name
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="w-full p-2 border rounded" />
            </label>
            <label className="block mb-4">
              Gender
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 border rounded">
                <option value="">Select...</option>
                <option value="man">Man</option>
                <option value="woman">Woman</option>
                <option value="non-binary">Non-Binary</option>
                <option value="other">Other</option>
                <option value="prefer-not">Prefer not to say</option>
              </select>
            </label>
            <button onClick={() => setStep(2)} className="bg-blue-600 text-white px-4 py-2 rounded w-full">Next</button>
          </>
        )}

        {step === 2 && (
          <>
            <label className="block mb-2">
              Zipcode
              <input type="text" name="zipcode" value={formData.zipcode} onChange={handleChange} maxLength="5" className="w-full p-2 border rounded" />
            </label>
            <p className="text-sm text-gray-600 mb-4">
              City: {formData.city || '—'} | State: {formData.state || '—'}
            </p>
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="bg-gray-300 px-4 py-2 rounded">Back</button>
              <button onClick={() => setStep(3)} disabled={!formData.city} className={`px-4 py-2 rounded text-white ${formData.city ? 'bg-blue-600' : 'bg-gray-400'}`}>Next</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <label className="block mb-2">
              Preferences
              <input type="text" name="preferences" value={formData.preferences} onChange={handleChange} className="w-full p-2 border rounded" />
            </label>
            <label className="block mb-2">
              Upload Avatar
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="w-full p-2 border rounded" />
            </label>
            <div className="flex items-center space-x-4 my-4">
              <img src={formData.avatar || defaultAvatar} alt="Avatar Preview" className="w-16 h-16 rounded-full" />
              <span className="text-sm text-gray-600">Avatar Preview</span>
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="bg-gray-300 px-4 py-2 rounded">Back</button>
              <button onClick={handleSubmit} disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded">
                {loading ? 'Saving...' : 'Finish'}
              </button>
            </div>
          </>
        )}

        {error && <p className="text-red-600 mt-4">{error}</p>}
      </div>
    </div>
  )
}
