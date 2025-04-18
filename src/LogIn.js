import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from './supabaseClient';
import loginImg from './assets/login_img.jpg';


const LogIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      navigate('/');  // Navigate to inbox after successful login
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="login-container">
      {/* Left Image */}
      <div className="login-image">
        <img src={loginImg} alt="Login Image" className="login-img" />
      </div>

      {/* Login Form */}
      <div className="login-form">
        <h1>Login</h1>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="input-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <button className="btn" type="submit">Log In</button>
        </form>

        <p className="signup-link">Don't have an account? <a href="/signup">Sign up</a></p>
      </div>
    </div>
  );
};

export default LogIn;
