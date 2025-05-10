import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Booking = () => {
  const [grounds, setGrounds] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState({});
  const [myBookings, setMyBookings] = useState([]);
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: '', email: '' });
  const [editingId, setEditingId] = useState(null);
  const [editSlots, setEditSlots] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  const loadAvailableSlots = useCallback(async (groundId, date) => {
    try {
      const res = await axios.get(
        `/api/bookings/available?groundId=${groundId}&date=${date}`,
      );
      setAvailableSlots(res.data.availableSlots || []);
    } catch (err) {
      console.error("Ошибка загрузки слотов:", err);
      setAvailableSlots([]);
    }
  }, []);

    const handleEditBooking = useCallback((booking) => {
      if (!booking?.ground?._id || !booking?.date) {
        alert("Невозможно загрузить доступные слоты");
        return;
      }
      setEditingId(booking._id);
      setEditSlots(booking.timeSlot);
      loadAvailableSlots(booking.ground._id, booking.date);
    }, [loadAvailableSlots]);

  const fetchMyBookings = async () => {
    try {
      const res = await axios.get('/api/bookings/my', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMyBookings(res.data.bookings || []);
    } catch (err) {
      console.error('Ошибка при получении бронирований:', err);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await axios.get('/api/users/me', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUser(res.data);
    } catch (err) {
      console.error('Ошибка загрузки пользователя');
    }
  };

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

    if (localStorage.getItem('token')) {
      fetchMyBookings();
      fetchUser();
    }
  }, []);

  const handleBook = async (groundId) => {
    const timeSlots = selectedSlots[groundId];
    if (!timeSlots || timeSlots.length === 0) return setMessage('Выберите время');
    try {
      await axios.post('/api/bookings', {
        ground: groundId,
        date: new Date().toISOString().split('T')[0],
        timeSlot: timeSlots
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessage('Успешно забронировано!');
      fetchMyBookings();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Ошибка бронирования');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/bookings/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessage('Бронирование удалено');
      fetchMyBookings();
    } catch (err) {
      console.error(err);
      setMessage('Ошибка при удалении');
    }
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`/api/bookings/${id}`, {
        timeSlot: editSlots
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEditingId(null);
      setEditSlots([]);
      setMessage('Бронирование обновлено');
      fetchMyBookings();
    } catch (err) {
      console.error('Ошибка обновления');
      setMessage('Ошибка обновления');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Выбор площадки</h2>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{user.name}</p>
          <p style={{ margin: 0, fontSize: 12, color: '#555' }}>{user.email}</p>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/');
            }}
            style={{ padding: '4px 8px', background: '#999', color: '#fff', border: 'none', borderRadius: 4, marginTop: 4 }}
          >
            Выйти
          </button>
        </div>
      </div>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {loading && <p>Загрузка...</p>}
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
        {grounds.length === 0 && !loading ? (
          <p>Нет доступных площадок</p>
        ) : (
          grounds.map(g => {
            return (
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
                    <strong>Available Hours:</strong>
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {g.availableHours && g.availableHours.start && g.availableHours.end ? (() => {
                      const startHour = parseInt(g.availableHours.start.split(':')[0]);
                      const endHour = parseInt(g.availableHours.end.split(':')[0]);
                      const slots = [];
                      for (let h = startHour; h < endHour; h++) {
                        const label = `${h.toString().padStart(2, '0')}:00–${(h + 1).toString().padStart(2, '0')}:00`;
                        slots.push(
                          <button
                            key={label}
                            onClick={() => {
                              setSelectedSlots((prev) => {
                                const existing = prev[g._id] || [];
                                return {
                                  ...prev,
                                  [g._id]: existing.includes(label)
                                    ? existing.filter(s => s !== label)
                                    : [...existing, label]
                                };
                              });
                            }}
                            style={{
                              padding: '4px 8px',
                              borderRadius: 4,
                              border: (selectedSlots[g._id] || []).includes(label) ? '2px solid green' : '1px solid #ccc',
                              backgroundColor: (selectedSlots[g._id] || []).includes(label) ? '#d4edda' : '#f8f9fa',
                              cursor: 'pointer',
                              fontSize: 12
                            }}
                          >
                            {label}
                          </button>
                        );
                      }
                      return slots;
                    })() : 'Не указано'}
                  </div>
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
                  onClick={() => handleBook(g._id)}
                >
                  Забронировать
                </button>
              </div>
            )
          })
        )}
      </div>
      {myBookings.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h3>Мои бронирования</h3>
          <ul>
            {myBookings.map((b) => (
              <li key={b._id}>
                {b.date?.substring(0, 10)} – {b.timeSlot.join(', ')} – {b.ground?.name}
                {editingId === b._id ? (
                  <div>
                    {availableSlots.length > 0 ? (
                      availableSlots.map(slot => (
                        <button
                          key={slot}
                          onClick={() =>
                            setEditSlots(prev =>
                              prev.includes(slot)
                                ? prev.filter(s => s !== slot)
                                : [...prev, slot]
                            )
                          }
                        style={{
                          padding: '4px 8px',
                          marginRight: 6,
                          marginBottom: 4,
                          borderRadius: 4,
                          backgroundColor: editSlots.includes(slot) ? '#007bff' : '#eee',
                          color: editSlots.includes(slot) ? '#fff' : '#000',
                          border: '1px solid #ccc'
                        }}
                      >
                        {slot}
                      </button>
                   ))
                    ) : (
                      <p>Нет доступных слотов для выбранной даты</p>
                    )}
                    <div style={{ marginTop: 6 }}>
                      <button onClick={() => handleUpdate(b._id)} style={{ marginRight: 6 }}>Сохранить</button>
                      <button onClick={() => { setEditingId(null); setEditSlots([]); }}>Отмена</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                    <button onClick={() => handleDelete(b._id)} style={{ background: 'red', color: 'white', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}>Удалить</button>
                    <button
                      onClick={() => handleEditBooking(b)}
                      style={{ background: 'gray', color: 'white', border: 'none', padding: '4px 8px', borderRadius: 4 }}
                    >
                      Изменить
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Booking;