import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // optional for navigation
import supabase from './supabaseClient';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // optional for redirects

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      console.log('Logged in as:', data.user.email);
      // Example redirect after login
      navigate('/dashboard'); // Or your own route
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin} autoComplete="off">
        <input
          type="email"
          placeholder="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Auth;
