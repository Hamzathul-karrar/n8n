import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios'; 
import './Login.css';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const successMessage = location.state?.successMessage || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); 

    try {
      const { data } = await axios.post('http://localhost:8080/api/login', { username, password });
      console.log('Login successful:', data);
      sessionStorage.setItem("username", username);
      sessionStorage.setItem("password", password);
      onLogin();
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Invalid username or password!';
      setError(errorMessage);
    }
  };

  return (
    <div className="login-container">
      {successMessage && <p className="success-message">{successMessage}</p>}
      <form onSubmit={handleSubmit} className="login-form">
        <div className="login-heading">Sign In</div>
        {error && <p className="error-message">{error}</p>}
        <input
          required
          className="login-input"
          type="text"
          name="username"
          id="username"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          required
          className="login-input"
          type="password"
          name="password"
          id="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input className="login-button" type="submit" value="Sign In" />
        <div className="login-signup-link">
          New user? <Link to="/signup" className="login-signup-link-text">Sign up</Link>
        </div>
      </form>
    </div>
  );
}

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

export default Login;
