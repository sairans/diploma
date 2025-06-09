import React, { useState, useEffect } from 'react';
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
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [step, setStep] = useState(0);
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [pricePerHour, setPricePerHour] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const isPastTime = (slot) => {
    if (!slot || date !== today) return false; // Проверяем, что slot существует
    const nowHour = new Date().getHours();
    const slotHour = parseInt(slot.split(':')[0]);
    return slotHour <= nowHour;
  };

  useEffect(() => {
    if (!groundId || !date) return;
    const fetchSlots = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const occupiedRes = await axios.get(
          `http://172.20.10.5:5001/api/bookings/occupied?groundId=${groundId}&date=${date}&fieldNumber=${fieldNumber}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const availableRes = await axios.get(
          `http://172.20.10.5:5001/api/bookings/available?groundId=${groundId}&date=${date}&fieldNumber=${fieldNumber}`,
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
  }, [groundId, date, fieldNumber]);

  useEffect(() => {
    const fetchGroundData = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5001/api/grounds/${groundId}`
        );
        setPricePerHour(res.data.pricePerHour); // Получаем цену за час с БД
      } catch (err) {
        console.error('Error fetching ground data:', err);
      }
    };

    fetchGroundData();
  }, [groundId]);

  const handleSlotSelection = (slot) => {
    if (selectedSlots.length < 5) {
      if (selectedSlots.includes(slot)) {
        setSelectedSlots(selectedSlots.filter((item) => item !== slot));
      } else {
        setSelectedSlots([...selectedSlots, slot]);
      }
    }
  };

  const calculateDuration = () => {
    if (selectedSlots.length < 2) return 1; // Если выбрано меньше двух слотов, длительность 1 час
    const sortedSlots = selectedSlots.slice().sort((a, b) => {
      const aHour = parseInt(a.split(':')[0]);
      const bHour = parseInt(b.split(':')[0]);
      return aHour - bHour;
    });
    const firstSlot = sortedSlots[0];
    const lastSlot = sortedSlots[sortedSlots.length - 1];
    const firstHour = parseInt(firstSlot.split(':')[0]);
    const lastHour = parseInt(lastSlot.split(':')[0]);
    return lastHour - firstHour + 1; // Разница между первым и последним слотом + 1 час
  };

  const calculateTotal = () => {
    const duration = calculateDuration();
    return duration * 5000; // 5000 тг/час
  };

  const handleSubmit = async () => {
    if (
      !groundId ||
      !date ||
      selectedSlots.length === 0 ||
      !fieldNumber ||
      !paymentMethod
    ) {
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
          timeSlot: selectedSlots,
          paymentMethod: paymentMethod // Добавляем выбранный метод оплаты
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      Alert.alert(
        'Успех',
        `Арендовано поле №${fieldNumber} на ${date}, время: ${selectedSlots.map((s) => (typeof s === 'string' ? s : s?.slot)).join(', ')}, оплата: ${paymentMethod}`,
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
                  fieldNumber === item.number
                    ? styles.selectedSlot
                    : styles.defaultSlot
                ]}
                onPress={() => setFieldNumber(item.number)}
              >
                <Text>{`Field #${item?.number ?? item}`}</Text>
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
        <ScrollView contentContainerStyle={{ paddingBottom: 200 }}>
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
            {(availableSlots || [])
              .concat(occupiedSlots || [])
              .map((slot, index) => {
                const disabled =
                  occupiedSlots.includes(slot) || isPastTime(slot);
                const isSelected = selectedSlots.includes(slot);

                return (
                  <TouchableOpacity
                    key={index} // Используем индекс или slot для ключа
                    disabled={disabled}
                    onPress={() => handleSlotSelection(slot)}
                    style={[
                      styles.slotButton,
                      isSelected && styles.selectedSlot,
                      disabled && { backgroundColor: '#eee' }
                    ]}
                  >
                    <Text
                      style={[styles.slotText, disabled && { color: '#aaa' }]}
                    >
                      {typeof slot === 'string' ? slot : slot?.slot}
                      {occupiedSlots.includes(slot) ? ' (Занято)' : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
          </View>
          {selectedSlots.length > 0 && (
            <View style={styles.selectedSlotsContainer}>
              <Text>Selected slots:</Text>
              <View style={styles.selectedSlots}>
                {selectedSlots.map((slot, index) => (
                  <Text key={index} style={styles.selectedSlotText}>
                    {typeof slot === 'string' ? slot : slot?.slot}
                  </Text>
                ))}
              </View>
            </View>
          )}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => setStep(2)}
          >
            <Text style={styles.submitButtonText}>Next</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {step === 2 && (
        <View>
          <Text style={styles.label}>Reservation Details</Text>
          <Text style={styles.text}>Field: #{fieldNumber}</Text>
          <Text style={styles.text}>Date: {date}</Text>
          <Text style={styles.text}>
            Time:{' '}
            {selectedSlots
              .map((s) => (typeof s === 'string' ? s : s?.slot))
              .join(', ')}
          </Text>
          <Text style={styles.text}>Duration: {calculateDuration()} hours</Text>

          <Text style={styles.label}>Payment Method</Text>
          <View style={styles.paymentMethods}>
            <TouchableOpacity
              style={[
                styles.paymentMethodButton,
                paymentMethod === 'cash' && styles.selectedPaymentMethod
              ]}
              onPress={() => setPaymentMethod('cash')}
            >
              <Text>Cash</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentMethodButton,
                paymentMethod === 'kaspi' && styles.selectedPaymentMethod
              ]}
              onPress={() => setPaymentMethod('kaspi')}
            >
              <Text>Kaspi Transfer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentMethodButton,
                paymentMethod === 'halyk' && styles.selectedPaymentMethod
              ]}
              onPress={() => setPaymentMethod('halyk')}
            >
              <Text>Halyk Transfer</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.text}>Price per hour: {pricePerHour} тг</Text>
          <Text style={styles.text}>
            Total: {pricePerHour * calculateDuration()} тг
          </Text>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Make reservation</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  selectedSlotsContainer: {
    marginVertical: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  selectedSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  selectedSlotText: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 5,
    marginRight: 5
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
  slotText: {
    color: '#1d1f1e'
  },
  selectedSlot: {
    backgroundColor: '#FDE047', // Цвет для выбранного слота
    borderColor: '#FDE047'
  },
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
    marginLeft: 10
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5
  },
  selector: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15
  },
  defaultSlot: {
    borderColor: '#ccc',
    backgroundColor: '#fff'
  },
  selectedSlot: {
    borderColor: '#888',
    backgroundColor: '#f0f0f0'
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
  },
  paymentMethods: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15
  },
  paymentMethodButton: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    width: '30%',
    alignItems: 'center',
    marginVertical: 5
  },
  selectedPaymentMethod: {
    backgroundColor: '#FDE047', // Цвет выбранного метода
    borderColor: '#FDE047'
  }
});
