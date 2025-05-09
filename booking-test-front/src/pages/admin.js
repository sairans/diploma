// src/pages/AdminPanel.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [grounds, setGrounds] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [newGround, setNewGround] = useState({
    name: '',
    type: 'football',
    coordinates: '',
    pricePerHour: 0,
    start: '09:00',
    end: '17:00'
  });

  const token = localStorage.getItem('token');
  const headers = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    axios.get('/api/users', headers).then(res => setUsers(res.data.users || []));
    axios.get('/api/grounds', headers).then(res => setGrounds(res.data.grounds || res.data));
    axios.get('/api/bookings/all', headers).then(res => setBookings(res.data.bookings || res.data));
  }, []);

  const handleAddGround = async () => {
    const payload = {
      name: newGround.name,
      type: newGround.type,
      pricePerHour: newGround.pricePerHour,
      location: {
        type: 'Point',
        coordinates: newGround.coordinates.split(',').map(Number)
      },
      availableHours: {
        start: newGround.start,
        end: newGround.end
      }
    };
    try {
      const res = await axios.post('/api/grounds', payload, headers);
      setGrounds([...grounds, res.data]);
      setNewGround({ name: '', type: 'football', coordinates: '', pricePerHour: 0, start: '09:00', end: '17:00' });
    } catch (err) {
      alert('Ошибка при создании площадки');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Админ-панель</h2>

      <h3>Добавить площадку</h3>
      <input placeholder="Название" value={newGround.name} onChange={e => setNewGround({ ...newGround, name: e.target.value })} />
      <select value={newGround.type} onChange={e => setNewGround({ ...newGround, type: e.target.value })}>
        <option value="football">Футбол</option>
        <option value="basketball">Баскетбол</option>
        <option value="volleyball">Волейбол</option>
      </select>
      <input placeholder="Координаты (долгота,широта)" value={newGround.coordinates} onChange={e => setNewGround({ ...newGround, coordinates: e.target.value })} />
      <input placeholder="Цена/час" type="number" value={newGround.pricePerHour} onChange={e => setNewGround({ ...newGround, pricePerHour: e.target.value })} />
      <input placeholder="Начало" type="time" value={newGround.start} onChange={e => setNewGround({ ...newGround, start: e.target.value })} />
      <input placeholder="Конец" type="time" value={newGround.end} onChange={e => setNewGround({ ...newGround, end: e.target.value })} />
      <button onClick={handleAddGround}>Создать</button>

      <h3>Пользователи</h3>
      <ul>
        {users.map(u => (
          <li key={u._id}>{u.name} – {u.email} – {u.isAdmin ? 'Admin' : 'User'}</li>
        ))}
      </ul>

      <h3>Площадки</h3>
      <ul>
        {grounds.map(g => (
          <li key={g._id}>{g.name} ({g.type}) — {g.pricePerHour}₸</li>
        ))}
      </ul>

      <h3>Бронирования</h3>
      <ul>
        {bookings.map(b => (
          <li key={b._id}>
            {b.date?.substring(0, 10)} – {b.timeSlot?.join(', ')} – {b.ground?.name || 'Unknown'} – {b.user?.name || 'Unknown'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPanel;