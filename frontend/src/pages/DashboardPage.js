// src/pages/DashboardPage.jsx
import { useEffect, useState } from 'react'
import supabase from '../supabaseClient'
import '../App.css'

export default function DashboardPage() {
  const [experiences, setExperiences] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()

      if (!user || userError) return

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
        .eq('reporter_id', user.id)
        .order('created_at', { ascending: false })

      if (!error) setExperiences(data)
      setLoading(false)
    }

    fetchData()
  }, [])

  return (
    <div className="container">
      <h2>My Logged Experiences</h2>

      {loading ? (
        <p>Loading...</p>
      ) : experiences.length === 0 ? (
        <p>You haven’t logged any interactions yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {experiences.map(exp => (
            <li key={exp.id} className="experience-item" style={{ border: '1px solid #eee', marginBottom: '1.5rem', padding: '1rem', borderRadius: '6px' }}>
              <strong>
                {exp.person_of_interest?.main_alias || 'Unknown'} —{' '}
                {exp.date_of_experience}
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
                  <a
                    href={exp.screenshot_url}
                    target="_blank"
                    rel="noreferrer"
                  >
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
