import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
  const [editingGround, setEditingGround] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const token = localStorage.getItem('token');
  const headers = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  // Загрузка данных
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [usersRes, groundsRes, bookingsRes] = await Promise.all([
        axios.get('/api/users', headers),
        axios.get('/api/grounds', headers),
        axios.get('/api/bookings/all', headers)
      ]);
      
      setUsers(usersRes.data.users || []);
      setGrounds(groundsRes.data.grounds || groundsRes.data || []);
      setBookings(bookingsRes.data.bookings || bookingsRes.data || []);
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
      alert('Ошибка загрузки данных');
    } finally {
      setIsLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Работа с площадками
  const handleEditGround = (ground) => {
    setEditingGround({
      ...ground,
      coordinates: ground.location?.coordinates?.join(',') || '',
      start: ground.availableHours?.start || '09:00',
      end: ground.availableHours?.end || '17:00',
    });
  };

  const handleSaveGround = async () => {
    try {
      const payload = {
        name: editingGround.name,
        type: editingGround.type,
        pricePerHour: editingGround.pricePerHour,
        location: {
          type: 'Point',
          coordinates: editingGround.coordinates.split(',').map(Number)
        },
        availableHours: {
          start: editingGround.start,
          end: editingGround.end
        }
      };
      
      const res = await axios.put(`/api/grounds/${editingGround._id}`, payload, headers);
      setGrounds(prev => prev.map(g => g._id === editingGround._id ? res.data : g));
      setEditingGround(null);
    } catch (err) {
      alert('Ошибка при обновлении площадки');
    }
  };

  const handleDeleteGround = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить площадку?')) return;
    
    try {
      await axios.delete(`/api/grounds/${id}`, headers);
      setGrounds(prev => prev.filter(g => g._id !== id));
    } catch (err) {
      alert('Ошибка при удалении площадки');
    }
  };

  // Работа с бронированиями
  const loadAvailableSlots = useCallback(async (groundId, date) => {
    try {
      const res = await axios.get(
        `/api/bookings/available?groundId=${groundId}&date=${date}`,
        headers
      );
      setAvailableSlots(res.data.availableSlots || []);
    } catch (err) {
      console.error("Ошибка загрузки слотов:", err);
      setAvailableSlots([]);
    }
  }, [headers]); // Добавляем headers в зависимости

  const handleEditBooking = useCallback((booking) => {
    if (!booking?.ground?._id || !booking?.date) {
      alert("Невозможно загрузить доступные слоты");
      return;
    }
    setEditingBooking(booking);
    loadAvailableSlots(booking.ground._id, booking.date);
  }, [loadAvailableSlots]);

  // const handleEditBooking = useCallback((booking) => {
  //   if (!booking || !booking.ground || !booking.ground._id) {
  //     console.error('Invalid booking data:', booking);
  //     alert('Невозможно редактировать бронирование: отсутствуют необходимые данные');
  //     return;
  //   }

  //   setEditingBooking({ 
  //     ...booking, 
  //     timeSlot: Array.isArray(booking.timeSlot) ? booking.timeSlot : [] 
  //   });
  //   loadAvailableSlots(booking.ground._id, booking.date);
  // }, [loadAvailableSlots]);

  const handleSaveBooking = async () => {
    try {
      await axios.put(
        `/api/bookings/${editingBooking._id}`, 
        { timeSlot: editingBooking.timeSlot }, 
        headers
      );
      
      setBookings(prev =>
        prev.map(b => b._id === editingBooking._id
          ? { ...b, timeSlot: editingBooking.timeSlot }
          : b
        )
      );
      setEditingBooking(null);
    } catch (err) {
      console.error('Ошибка обновления бронирования', err);
      alert('Ошибка обновления');
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить бронирование?')) return;
    
    try {
      await axios.delete(`/api/bookings/${id}`, headers);
      setBookings(prev => prev.filter(b => b._id !== id));
    } catch (err) {
      alert('Ошибка при удалении бронирования');
    }
  };

  // Добавление новой площадки
  const handleAddGround = async () => {
    try {
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
      
      const res = await axios.post('/api/grounds', payload, headers);
      setGrounds(prev => [...prev, res.data]);
      setNewGround({ 
        name: '', 
        type: 'football', 
        coordinates: '', 
        pricePerHour: 0, 
        start: '09:00', 
        end: '17:00' 
      });
    } catch (err) {
      alert('Ошибка при создании площадки');
    }
  };

  if (isLoading) return <div style={{ padding: 20 }}>Загрузка...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Админ-панель</h2>

      {/* Форма добавления площадки */}
      <section style={{ marginBottom: 30 }}>
        <h3>Добавить площадку</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 200 }}>
            <label>Название</label>
            <input 
              value={newGround.name} 
              onChange={e => setNewGround({ ...newGround, name: e.target.value })} 
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 150 }}>
            <label>Тип</label>
            <select 
              value={newGround.type} 
              onChange={e => setNewGround({ ...newGround, type: e.target.value })}
            >
              <option value="football">Футбол</option>
              <option value="basketball">Баскетбол</option>
              <option value="volleyball">Волейбол</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 250 }}>
            <label>Координаты (долгота,широта)</label>
            <input 
              value={newGround.coordinates} 
              onChange={e => setNewGround({ ...newGround, coordinates: e.target.value })} 
              placeholder="например: 76.912,43.256"
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 120 }}>
            <label>Цена/час</label>
            <input 
              type="number" 
              value={newGround.pricePerHour} 
              onChange={e => setNewGround({ ...newGround, pricePerHour: Number(e.target.value) })} 
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 120 }}>
            <label>Начало работы</label>
            <input 
              type="time" 
              value={newGround.start} 
              onChange={e => setNewGround({ ...newGround, start: e.target.value })} 
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 120 }}>
            <label>Конец работы</label>
            <input 
              type="time" 
              value={newGround.end} 
              onChange={e => setNewGround({ ...newGround, end: e.target.value })} 
            />
          </div>
        </div>
        <button onClick={handleAddGround}>Создать</button>
      </section>

      {/* Редактирование площадки */}
      {editingGround && (
        <section style={{ marginBottom: 30 }}>
          <h3>Редактировать площадку</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
            <input 
              value={editingGround.name} 
              onChange={e => setEditingGround({ ...editingGround, name: e.target.value })} 
              placeholder="Название"
            />
            
            <select 
              value={editingGround.type} 
              onChange={e => setEditingGround({ ...editingGround, type: e.target.value })}
            >
              <option value="football">Футбол</option>
              <option value="basketball">Баскетбол</option>
              <option value="volleyball">Волейбол</option>
            </select>
            
            <input 
              value={editingGround.coordinates} 
              onChange={e => setEditingGround({ ...editingGround, coordinates: e.target.value })} 
              placeholder="Координаты"
            />
            
            <input 
              type="number" 
              value={editingGround.pricePerHour} 
              onChange={e => setEditingGround({ ...editingGround, pricePerHour: Number(e.target.value) })} 
              placeholder="Цена"
            />
            
            <input 
              type="time" 
              value={editingGround.start} 
              onChange={e => setEditingGround({ ...editingGround, start: e.target.value })} 
            />
            
            <input 
              type="time" 
              value={editingGround.end} 
              onChange={e => setEditingGround({ ...editingGround, end: e.target.value })} 
            />
          </div>
          <button onClick={handleSaveGround}>Сохранить</button>
          <button 
            onClick={() => setEditingGround(null)} 
            style={{ marginLeft: 10 }}
          >
            Отмена
          </button>
        </section>
      )}

      {/* Список пользователей */}
      <section style={{ marginBottom: 30 }}>
        <h3>Пользователи ({users.length})</h3>
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Имя</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Роль</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{u.name}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{u.email}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{u.isAdmin ? 'Admin' : 'User'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Список площадок */}
      <section style={{ marginBottom: 30 }}>
        <h3>Площадки ({grounds.length})</h3>
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Название</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Тип</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Цена/час</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Часы работы</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {grounds.map(g => (
                <tr key={g._id}>
                  <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{g.name}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{g.type}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{g.pricePerHour}₸</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                    {g.availableHours?.start} - {g.availableHours?.end}
                  </td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                    <button 
                      onClick={() => handleEditGround(g)}
                      style={{ marginRight: 6 }}
                    >
                      Изменить
                    </button>
                    <button 
                      onClick={() => handleDeleteGround(g._id)}
                      style={{ color: 'red' }}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Бронирования */}
      <section>
        <h3>Бронирования ({bookings.length})</h3>
        
        {editingBooking && (
          <div style={{ marginBottom: 20, padding: 15, border: '1px solid #eee', borderRadius: 4 }}>
            <h4>Редактировать бронирование</h4>
            <p>
              <strong>Дата:</strong> {editingBooking.date?.substring(0, 10)}<br />
              <strong>Площадка:</strong> {editingBooking.ground?.name || 'Unknown'}<br />
              <strong>Пользователь:</strong> {editingBooking.user?.name || 'Unknown'}
            </p>
            
            <div style={{ margin: '15px 0' }}>
              <h5>Доступные временные слоты:</h5>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {availableSlots.map(slot => (
                  <button
                    key={slot}
                    onClick={() =>
                      setEditingBooking(prev => ({
                        ...prev,
                        timeSlot: prev.timeSlot.includes(slot)
                          ? prev.timeSlot.filter(s => s !== slot)
                          : [...prev.timeSlot, slot]
                      }))
                    }
                    style={{
                      padding: '6px 12px',
                      borderRadius: 4,
                      backgroundColor: editingBooking.timeSlot.includes(slot) 
                        ? '#28a745' 
                        : '#f0f0f0',
                      color: editingBooking.timeSlot.includes(slot) 
                        ? '#fff' 
                        : '#000',
                      border: '1px solid #ddd',
                      cursor: 'pointer'
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <button onClick={handleSaveBooking}>Сохранить</button>
              <button 
                onClick={() => setEditingBooking(null)} 
                style={{ marginLeft: 10 }}
              >
                Отмена
              </button>
            </div>
          </div>
        )}
        
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Дата</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Время</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Площадка</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Пользователь</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b._id}>
                  <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                    {b.date?.substring(0, 10)}
                  </td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                    {Array.isArray(b.timeSlot) ? b.timeSlot.join(', ') : b.timeSlot}
                  </td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                    {b.ground?.name || 'Unknown'}
                  </td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                    {b.user?.name || 'Unknown'}
                  </td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                    <button 
                      onClick={() => handleEditBooking(b)}
                      style={{ marginRight: 6 }}
                    >
                      Изменить
                    </button>
                    <button 
                      onClick={() => handleDeleteBooking(b._id)}
                      style={{ color: 'red' }}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminPanel;