import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    avatar: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const register = async () => {
    try {
      await axios.post('/api/users/register', form);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Register error');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ width: '320px', padding: 20, border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center' }}>Регистрация</h2>

        <input
          name="name"
          placeholder="Имя"
          value={form.name}
          onChange={handleChange}
          style={{ width: '93%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          style={{ width: '93%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          name="phone"
          placeholder="Телефон"
          value={form.phone}
          onChange={handleChange}
          style={{ width: '93%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          name="password"
          type="password"
          placeholder="Пароль"
          value={form.password}
          onChange={handleChange}
          style={{ width: '93%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button
          onClick={register}
          style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}
        >
          Зарегистрироваться
        </button>
      </div>
    </div>
  );
};

export default Register;