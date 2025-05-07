import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Booking = () => {
  const [grounds, setGrounds] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5001/api/grounds')
      .then(res => {
        console.log('Grounds response:', res.data);
        setGrounds(res.data.grounds || []);
      })
      .catch(err => {
        console.error('Ошибка при загрузке площадок:', err);
        setMessage('Ошибка загрузки площадок');
      });
  }, []);

  const book = async (groundId) => {
    const date = new Date().toISOString().split('T')[0];
    const timeSlot = ['10:00–11:00'];
    try {
      await axios.post('http://localhost:5001/api/bookings', { ground: groundId, date, timeSlot });
      setMessage('Забронировано!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Ошибка бронирования');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Выбор площадки</h2>
      {message && <p>{message}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
        {grounds.map(g => (
          <div key={g._id} style={{ border: '1px solid #ccc', borderRadius: 10, padding: 10, width: 200 }}>
            <h4>{g.name}</h4>
            <p>{g.location?.coordinates?.join(', ')}</p>
            <button onClick={() => book(g._id)}>Забронировать</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Booking;