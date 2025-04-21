import React from 'react';
import { Link } from 'react-router-dom';
import logo from './assets/logo.png'; // Import your logo

const HomePage = () => {
  return (
    <div className="home-page">
      <img src={logo} alt="App Logo" className="logo" />
      <p>Your Heart, Your Lock, Your Trust</p>
      <div className="home-buttons">
        <Link to="/login">
          <button className="btn">Log In</button>
        </Link>
        <Link to="/signup">
          <button className="btn">Sign Up</button>
        </Link>
+       {/* New button to log an experience */}
+       <Link to="/add-experience">
+         <button className="btn">Log an Experience</button>
+       </Link>
      </div>
    </div>
  );
};

export default HomePage;
