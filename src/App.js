import React from 'react';
import { Routes, Route } from 'react-router-dom';  // Remove BrowserRouter import

import Inbox from './Inbox';  // Import Inbox Component
import LogIn from './LogIn';  // Import LogIn Component
import SignUp from './SignUp'; // Import SignUp Component
import HomePage from './HomePage'; // Import HomePage Component

function App() {
  return (
    <Routes>  {/* Use Routes directly here */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LogIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/inbox" element={<Inbox />} />
    </Routes>
  );
}

export default App;
