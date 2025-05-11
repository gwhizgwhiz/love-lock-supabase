import React from 'react'
import { useMyCircles } from '../hooks/useCircles'
import { useNavigate } from 'react-router-dom'
import '../App.css'

export default function MyCirclesPage() {
  const navigate = useNavigate()
  const { circles, loading, error } = useMyCircles()

  if (loading) return <p>Loading your circles…</p>
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
    </main>
  )
}
