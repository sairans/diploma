import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const register = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/register', { email, password });
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Register error');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Register</h2>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /><br />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} /><br />
      <button onClick={register}>Register</button>
    </div>
  );
};

export default Register;