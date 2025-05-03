// src/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './App.css';  // keep existing styles

export default function HomePage() {
  return (
    <div className="home-container">
      <section className="banner">
        <h1>Your Heart, Your Lock, Your Trust</h1>
        <p>
          Welcome to Love Lock—share your experiences, build trust, and connect
          with confidence. Log an experience, explore profiles, and see how
          trust grows with every interaction.
        </p>
        <div className="home-buttons">
          <Link to="/add-experience">
            <button className="btn">Rate a Date</button>
          </Link>
          <Link to="/profiles">
            <button className="btn">Browse Profiles</button>
          </Link>
        </div>
      </section>
    </div>
  );
}
