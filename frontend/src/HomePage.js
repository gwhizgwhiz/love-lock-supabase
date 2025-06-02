// src/HomePage.js
import { Link } from 'react-router-dom';
// import { Search, PenLine, Lock } from 'lucide-react';
import './App.css'; // Existing styles

export default function HomePage() {
  return (
    <div className="home-container">
      <section className="banner">
        <h1>Your Heart, Your Lock, Your Trust</h1>
        <p>
          Welcome to LoveLock—share your experiences, build trust, and connect
          with confidence. Log an experience, explore profiles, and see how trust
          grows with every interaction.
        </p>
        <div className="home-buttons">
          <Link to="/interactions">
            <button className="btn">Log an Experience</button>
          </Link>
          <Link to="/persons">
            <button className="btn">Browse Profiles</button>
          </Link>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How LoveLock Works</h2>
        <div className="steps">
          <div className="step">
            <span role="img" aria-label="Search">🔍</span>
            <h3>Find</h3>
            <p>Look up profiles of people you've met on dating apps or in real life.</p>
          </div>
          <div className="step">
            <span role="img" aria-label="Write">📝</span>
            <h3>Share</h3>
            <p>Log your dating experience to help others stay informed and safe.</p>
          </div>
          <div className="step">
            <span role="img" aria-label="Heart">🔒</span>
            <h3>Trust</h3>
            <p>Explore trust scores and discover who's worthy of your time.</p>
          </div>
        </div>
      </section>

      <section className="heart-scores">
        <h2>What the Hearts Mean</h2>
        <div className="hearts-row">
          <div className="heart">
            <span className="heart-icon red">❤️</span>
            <p>Top-rated, trustworthy.</p>
          </div>
          <div className="heart">
            <span className="heart-icon white">🤍</span>
            <p>New, no reviews yet.</p>
          </div>
          <div className="heart">
            <span className="heart-icon green">💚</span>
            <p>Good experience, safe choice.</p>
          </div>
          <div className="heart">
            <span className="heart-icon yellow">💛</span>
            <p>Mixed reviews, proceed with caution.</p>
          </div>
          <div className="heart">
            <span className="heart-icon black">🖤</span>
            <p>High-risk, proceed carefully.</p>
          </div>
        </div>
      </section>

      <section className="get-started">
        <h2>Ready to build trust together?</h2>
        <p>Log an interaction, browse profiles, and make dating safer for everyone.</p>
        <div className="home-buttons">
          <Link to="/signup">
            <button className="btn">Sign Up</button>
          </Link>
        </div>
      </section>
    </div>
  );
}
