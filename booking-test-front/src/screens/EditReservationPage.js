import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EditReservationPage({ route, navigation }) {
  const [bookingId, setBookingId] = useState(route.params?.bookingId);
  const [data, setData] = useState(null);
  const [fieldNumber, setFieldNumber] = useState();
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [fields, setFields] = useState([
    { number: 1 },
    { number: 2 },
    { number: 3 }
  ]);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    console.log('Route params:', route.params);
    const fetchBooking = async () => {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(
        `http://172.20.10.5:5001/api/bookings/${route.params?.bookingId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const booking = res.data;
      setData(booking);
      setFieldNumber(booking.fieldNumber);
      setDate(booking.date);
      setTimeSlot(booking.timeSlot[0]);
    };
    if (route.params?.bookingId) {
      setBookingId(route.params.bookingId);
      fetchBooking();
    }
  }, [route.params]);

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(
        `http://172.20.10.5:5001/api/bookings/${bookingId}`,
        {
          fieldNumber,
          date,
          timeSlot: [timeSlot]
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      Alert.alert('Success', 'Reservation updated');
      console.log('bookingId', bookingId);
      console.log('data being sent:', {
        fieldNumber,
        date,
        timeSlot: [timeSlot]
      });
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to update reservation');
      console.log('bookingId', bookingId);
      console.log('data being sent:', {
        fieldNumber,
        date,
        timeSlot: [timeSlot]
      });
    }
  };

  const isPastTime = (slot) => {
    if (date !== today) return false;
    const nowHour = new Date().getHours();
    const slotHour = parseInt(slot.split(':')[0]);
    return slotHour <= nowHour;
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 50,
          marginBottom: 20
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginRight: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
          Edit reservation
        </Text>
      </View>

      <Text style={{ fontWeight: '600' }}>Select Field</Text>
      <FlatList
        data={fields}
        horizontal
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setFieldNumber(item.number)}
            style={{
              padding: 12,
              margin: 4,
              borderRadius: 10,
              backgroundColor: fieldNumber === item.number ? '#FDE047' : '#eee'
            }}
          >
            <Text>Field #{item.number}</Text>
          </TouchableOpacity>
        )}
      />

      <Text style={{ fontWeight: '600', marginTop: 20 }}>Select Date</Text>
      <Calendar
        minDate={today}
        onDayPress={(d) => setDate(d.dateString)}
        markedDates={{ [date]: { selected: true, selectedColor: '#000' } }}
      />

      <Text style={{ fontWeight: '600', marginTop: 20 }}>Select Time</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00'].map((slot) => (
          <TouchableOpacity
            key={slot}
            disabled={isPastTime(slot)}
            onPress={() => setTimeSlot(slot)}
            style={{
              backgroundColor: timeSlot === slot ? '#FDE047' : '#eee',
              opacity: isPastTime(slot) ? 0.4 : 1,
              padding: 10,
              borderRadius: 8,
              margin: 4
            }}
          >
            <Text>{slot}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={handleSave}
        style={{
          backgroundColor: '#FDE047',
          padding: 16,
          marginTop: 40,
          borderRadius: 10,
          alignItems: 'center'
        }}
      >
        <Text style={{ fontWeight: 'bold' }}>Save edit</Text>
      </TouchableOpacity>
    </View>
  );
}
