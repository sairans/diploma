import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Booking = () => {
  const [grounds, setGrounds] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get('/api/grounds')
      .then(res => {
        console.log('Ответ сервера:', res.data);
        setGrounds(res.data.grounds || res.data || []); // Подстраховка на разные форматы ответа
      })
      .catch(err => {
        console.error('Ошибка:', err);
        setMessage(err.response?.data?.message || 'Ошибка загрузки площадок');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Выбор площадки</h2>
      {message && <p style={{ color: 'red' }}>{message}</p>}
      {loading && <p>Загрузка...</p>}
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
        {grounds.length === 0 && !loading ? (
          <p>Нет доступных площадок</p>
        ) : (
          grounds.map(g => (
            <div key={g._id} style={{ 
              border: '1px solid #ccc', 
              borderRadius: 10, 
              padding: 10, 
              width: 200,
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}>
              <h4 style={{ margin: 0 }}>{g.name}</h4>
              <p style={{ margin: 0, fontSize: 14, color: '#666' }}>
                {g.location?.coordinates?.join(', ') || 'Адрес не указан'}
              </p>
              
              <div style={{ marginTop: 8 }}>
                <p style={{ margin: '4px 0', fontSize: 14 }}>
                  <strong>Тип:</strong> {g.type || "Не указан"}
                </p>
                <p style={{ margin: '4px 0', fontSize: 14 }}>
                  <strong>Цена:</strong> {g.pricePerHour || "—"} ₽/час
                </p>
                <p style={{ margin: '4px 0', fontSize: 14 }}>
                  <strong>Часы работы:</strong> {g.availableHours ? (
                    `${g.availableHours.start} - ${g.availableHours.end}`
                  ) : 'Не указано'}
                </p>
              </div>

              <button 
                style={{
                  marginTop: 'auto',
                  padding: '8px 12px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: 5,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 'bold',
                  transition: 'background-color 0.3s',
                  alignSelf: 'flex-start',
                  width: '100%'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}
              >
                Забронировать
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Booking;