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
  const [fields, setFields] = useState([]); // To store field numbers dynamically
  const [availableSlots, setAvailableSlots] = useState([]); // To store available slots for the selected date and field
  const [occupiedSlots, setOccupiedSlots] = useState([]); // To store occupied slots for the selected date and field
  const [selectedSlots, setSelectedSlots] = useState([]);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Fetch all fields (for example, from API or hardcoded if static)
    const fetchFields = async () => {
      // If you have an API for fields, fetch from there. For now, assume 5 fields:
      setFields([
        { number: 1 },
        { number: 2 },
        { number: 3 },
        { number: 4 },
        { number: 5 }
      ]);
    };
    fetchFields();

    const fetchBooking = async () => {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(
        `http://192.168.59.11:5001/api/bookings/${route.params?.bookingId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const booking = res.data;
      setData(booking);
      setFieldNumber(booking.fieldNumber);
      setDate(booking.date);
      setSelectedSlots(booking.timeSlot);
    };
    if (route.params?.bookingId) {
      setBookingId(route.params.bookingId);
      fetchBooking();
    }
  }, [route.params]);

  useEffect(() => {
    if (!date || !fieldNumber) return;

    const fetchSlots = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const occupiedRes = await axios.get(
          `http://192.168.59.11:5001/api/bookings/occupied?date=${date}&fieldNumber=${fieldNumber}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const availableRes = await axios.get(
          `http://192.168.59.11:5001/api/bookings/available?date=${date}&fieldNumber=${fieldNumber}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setOccupiedSlots(occupiedRes.data?.occupiedSlots || []);
        setAvailableSlots(availableRes.data?.availableSlots || []);
      } catch (e) {
        setOccupiedSlots([]);
        setAvailableSlots([]);
      }
    };

    fetchSlots();
  }, [date, fieldNumber]);

  const handleSave = async () => {
    if (!availableSlots.includes(fieldNumber)) {
      Alert.alert('Error', 'Field is not available for this date');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(
        `http://192.168.59.11:5001/api/bookings/${bookingId}`,
        {
          fieldNumber,
          date,
          timeSlot: selectedSlots
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      Alert.alert('Success', 'Reservation updated');
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to update reservation');
    }
  };

  const handleSlotSelection = (slot) => {
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(selectedSlots.filter((s) => s !== slot));
    } else if (!data || selectedSlots.length < data.timeSlot.length) {
      setSelectedSlots([...selectedSlots, slot]);
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
        keyExtractor={(item) => item.number.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setFieldNumber(item.number)}
            style={{
              padding: 12,
              margin: 4,
              borderRadius: 10,
              backgroundColor:
                fieldNumber === item.number ? '#FDE047' : '#d1fae5'
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
      {availableSlots.length || selectedSlots.length ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {Array.from(new Set([...availableSlots, ...selectedSlots]))
            .sort()
            .map((slot) => {
              const disabled =
                (occupiedSlots.includes(slot) &&
                  !selectedSlots.includes(slot)) ||
                isPastTime(slot);
              return (
                <TouchableOpacity
                  key={slot}
                  disabled={disabled}
                  onPress={() => handleSlotSelection(slot)}
                  style={{
                    backgroundColor: selectedSlots.includes(slot)
                      ? '#FDE047'
                      : '#eee',
                    opacity: disabled ? 0.4 : 1,
                    padding: 10,
                    borderRadius: 8,
                    margin: 4
                  }}
                >
                  <Text>
                    {slot}
                    {occupiedSlots.includes(slot) &&
                    !selectedSlots.includes(slot)
                      ? ' (Занято)'
                      : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
        </View>
      ) : (
        <Text style={{ marginTop: 10, color: '#999' }}>
          No available slots for this date.
        </Text>
      )}

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
