import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../supabaseClient'
import useAuth from '../hooks/useAuth'
import '../App.css'

export default function MyCirclesPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  const [circles, setCircles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setLoading(false)
      setError(new Error('Not authenticated'))
      return
    }

    const loadCircles = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('circles')
        .select('*')
        .eq('created_by', user.id)

      if (error) {
        setError(error)
      } else {
        setCircles(data || [])
      }
      setLoading(false)
    }

    loadCircles()
  }, [authLoading, user])

  if (loading || authLoading) return <p>Loading your circles…</p>
  if (error) return <p>Error: {error.message}</p>

  return (
    <main className="container">
      <h1>My Circles</h1>
      <button
        className="btn btn-small btn-outline"
        onClick={() => navigate('/create-circle')}
      >
        Create Circle
      </button>

      {circles.length === 0 ? (
        <p>You have no circles yet.</p>
      ) : (
        <div className="circle-map">
          {circles.map(c => (
            <div
              key={c.id}
              className="circle-item jitter"
              onClick={() => navigate(`/circles/${c.slug}`)}
            >
              <span className="circle-icon">{c.icon}</span>
              <div className="circle-name">{c.name}</div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
