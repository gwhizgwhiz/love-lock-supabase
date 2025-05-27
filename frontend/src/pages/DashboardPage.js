// src/pages/DashboardPage.jsx

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../supabaseClient'
import useCurrentUser from '../hooks/useCurrentUser'
import '../App.css'

export default function DashboardPage() {
  const { userId, loading: authLoading, error: authError, user } = useCurrentUser()
  const [experiences, setExperiences] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  console.log('🧭 DashboardPage Rendered')
  console.log('✅ userId:', userId)
  console.log('✅ authLoading:', authLoading)
  console.log('✅ authError:', authError)
  console.log('✅ user:', user)

  useEffect(() => {
    if (authLoading) {
      console.log('⏳ Auth still loading...')
      return
    }

    if (!userId) {
      console.log('❌ No userId found—skipping data fetch.')
      setError('No user session found.')
      setLoading(false)
      return
    }

    const fetchData = async () => {
      console.log('🚀 Fetching experiences for userId:', userId)

      const { data, error } = await supabase
        .from('person_experiences')
        .select(`
          id,
          created_at,
          date_of_experience,
          profile_match_vote,
          what_went_right,
          what_went_wrong,
          screenshot_url,
          person_of_interest (
            main_alias,
            slug
          )
        `)
        .eq('created_by', userId) // 🩹 Fixed: was reporter_id, now created_by
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Supabase error:', error)
        setError(error.message || 'An error occurred.')
      } else {
        console.log('✅ Data fetched:', data)
        setExperiences(data)
      }
      setLoading(false)
    }

    fetchData()
  }, [userId, authLoading])

  const handleNewInteraction = () => {
    navigate('/rate-date')
  }

  if (authLoading || loading) {
    return (
      <div className="container">
        <h2>Dashboard Loading...</h2>
        <p>authLoading: {authLoading ? 'true' : 'false'}</p>
        <p>loading: {loading ? 'true' : 'false'}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <h2>Error</h2>
        <p className="error">{error}</p>
      </div>
    )
  }

  return (
    <div className="container">
      <h2>Dashboard Page Rendered</h2>
      <p>userId: {userId || 'null'}</p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>My Logged Experiences</h2>
        <button className="btn" onClick={handleNewInteraction}>
          ➕ Log New Interaction
        </button>
      </div>

      {experiences.length === 0 ? (
        <p>You haven’t logged any interactions yet. Click the button above to get started!</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {experiences.map(exp => (
            <li
              key={exp.id}
              className="experience-item"
              style={{
                border: '1px solid #eee',
                marginBottom: '1.5rem',
                padding: '1rem',
                borderRadius: '6px'
              }}
            >
              <strong>
                {exp.person_of_interest?.main_alias || 'Unknown'} —{' '}
                {exp.date_of_experience || 'Missing Date'}
              </strong>
              {exp.profile_match_vote && (
                <div style={{ margin: '0.5rem 0' }}>
                  Profile Accuracy: <em>{exp.profile_match_vote}</em>
                </div>
              )}
              {exp.what_went_right && <div>✅ {exp.what_went_right}</div>}
              {exp.what_went_wrong && <div>❌ {exp.what_went_wrong}</div>}
              {exp.screenshot_url && (
                <div>
                  <a href={exp.screenshot_url} target="_blank" rel="noreferrer">
                    View Screenshot
                  </a>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
