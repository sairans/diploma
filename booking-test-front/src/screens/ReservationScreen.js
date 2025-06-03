import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  FlatList,
  Alert,
  ScrollView,
  SafeAreaView,
  Platform
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ReservationPage() {
  const route = useRoute();
  const navigation = useNavigation();
  const { groundId, fields } = route.params;

  const [fieldNumber, setFieldNumber] = useState(fields[0]?.number || '');
  const [date, setDate] = useState('');
  const [timeslot, setTimeslot] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [step, setStep] = useState(0);

  const today = new Date().toISOString().split('T')[0];
  const isPastTime = (slot) => {
    if (date !== today) return false;
    const nowHour = new Date().getHours();
    const slotHour = parseInt(slot.split(':')[0]);
    return slotHour <= nowHour;
  };

  const handleSubmit = async () => {
    if (!groundId || !date || !timeslot || !fieldNumber) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');

      await axios.post(
        'http://172.20.10.5:5001/api/bookings',
        {
          ground: groundId,
          fieldNumber: fieldNumber,
          date: date,
          timeSlot: [timeslot]
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      Alert.alert(
        'Успех',
        `Арендовано поле №${fieldNumber} на ${date}, время: ${timeslot}`,
        [
          {
            text: 'ОК',
            onPress: () => {
              navigation.navigate('MainTabs', { screen: 'Reservations' });
            }
          }
        ]
      );
    } catch (err) {
      Alert.alert(
        'Ошибка',
        err.response?.data?.message || 'Не удалось создать бронирование'
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (step === 0 ? navigation.goBack() : setStep(step - 1))}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Reservation</Text>
      </View>

      <View style={styles.steps}>
        {['Select field', 'Select date', 'Details'].map((label, i) => (
          <View key={i} style={styles.step}>
            <Text style={[styles.stepText, step === i && styles.activeStep]}>
              {label}
            </Text>
            {i < 2 && <Text style={styles.stepText}>{'>'}</Text>}
          </View>
        ))}
      </View>

      {step === 0 && (
        <>
          <Text style={styles.label}>Select a field:</Text>
          <FlatList
            data={fields}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.selector,
                  fieldNumber === item.number && styles.selectedSlot
                ]}
                onPress={() => setFieldNumber(item.number)}
              >
                <Text>Field #{item.number}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => setStep(1)}
          >
            <Text style={styles.submitButtonText}>Next</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 1 && (
        <>
          <Calendar
            minDate={today}
            onDayPress={(day) => setDate(day.dateString)}
            markedDates={{
              [date]: { selected: true, selectedColor: '#1d1f1e' }
            }}
            theme={{
              selectedDayBackgroundColor: '#1d1f1e',
              selectedDayTextColor: '#FFFBD4'
            }}
            style={styles.calendar}
          />
          <Text style={styles.label}>Select time:</Text>
          <View style={styles.slotsContainer}>
            {[
              '09:00–10:00',
              '10:00–11:00',
              '11:00–12:00',
              '12:00–13:00',
              '13:00–14:00',
              '14:00–15:00',
              '15:00–16:00',
              '16:00–17:00'
            ].map((slot) => {
              const disabled = isPastTime(slot);
              return (
                <TouchableOpacity
                  key={slot}
                  disabled={disabled}
                  onPress={() => setTimeslot(slot)}
                  style={[
                    styles.slotButton,
                    timeslot === slot && styles.selectedSlot,
                    disabled && { backgroundColor: '#eee' }
                  ]}
                >
                  <Text
                    style={[styles.slotText, disabled && { color: '#aaa' }]}
                  >
                    {slot}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => setStep(2)}
          >
            <Text style={styles.submitButtonText}>Next</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 2 && (
        <View>
          <Text style={styles.label}>Reservation Details</Text>
          <Text style={styles.text}>Arena ID: {groundId}</Text>
          <Text style={styles.text}>Field: #{fieldNumber}</Text>
          <Text style={styles.text}>Date: {date}</Text>
          <Text style={styles.text}>Time: {timeslot}</Text>
          <Text style={styles.text}>Duration: 1 hour</Text>
          <Text style={styles.text}>Total: 50,000 тг</Text>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Make reservation</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
    backgroundColor: '#fff'
  },
  container: {
    paddingTop: 50,
    padding: 20,
    flexGrow: 1,
    backgroundColor: '#fff'
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingTop: 30,
    marginBottom: 20,
    marginLeft: 50
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5
  },
  selector: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15
  },
  calendar: {
    marginBottom: 15
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  slotButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginBottom: 10,
    width: '48%',
    alignItems: 'center'
  },
  selectedSlot: {
    backgroundColor: '#1d1f1e'
  },
  slotText: {
    color: '#1d1f1e'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15
  },
  submitButton: {
    backgroundColor: '#FFD700',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10
  },
  submitButtonText: {
    color: '#000',
    fontWeight: 'bold'
  },
  modalContent: {
    padding: 20,
    marginTop: 50,
    flex: 1
  },
  option: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd'
  },
  cancelButton: {
    marginTop: 20,
    backgroundColor: '#d9534f',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  steps: { flexDirection: 'row', justifyContent: 'center', marginVertical: 20 },
  step: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 4 },
  stepText: { fontSize: 12, color: '#bbb' },
  activeStep: { color: '#000', fontWeight: 'bold' },
  text: {
    marginBottom: 5
  }
});
