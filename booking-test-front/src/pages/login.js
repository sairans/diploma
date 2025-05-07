import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const login = async () => {
    try {
      const res = await axios.post('http://localhost:5001/api/users/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/bookings');
    } catch (err) {
        console.error('Login error:', err);
        alert(err.response?.data?.message || 'Login error');
      }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /><br />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} /><br />
      <button onClick={login}>Login</button>
      <p onClick={() => navigate('/register')} style={{ cursor: 'pointer', color: 'blue' }}>No account? Register</p>
    </div>
  );
};

export default Login;