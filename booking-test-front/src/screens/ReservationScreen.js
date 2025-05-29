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
<<<<<<< HEAD
import { Ionicons } from '@expo/vector-icons';
=======
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
>>>>>>> 5e509252dbd5080c9ccb3b379becf9cebed321e1

export default function ReservationPage() {
  const route = useRoute();
  const navigation = useNavigation();
  const { groundId, fields } = route.params;

  const [fieldNumber, setFieldNumber] = useState(fields[0]?.number || '');
  const [date, setDate] = useState('');
  const [timeslot, setTimeslot] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const handleSubmit = async () => {
    if (!groundId || !date || !timeslot || !fieldNumber) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');

      await axios.post(
        'http://192.168.221.11:5001/api/bookings',
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
              navigation.navigate('ActiveReservationScreen');
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
<<<<<<< HEAD
    
    <View style={styles.container}>
      <View style={styles.header}>
  <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
    <Ionicons name="arrow-back" size={24} color="white" />
  </TouchableOpacity>
  <Text style={styles.title}>Reservation</Text>
</View>

      <Text style={styles.label}>Поле:</Text>
=======
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Поле:</Text>
>>>>>>> 5e509252dbd5080c9ccb3b379becf9cebed321e1

        <TouchableOpacity
          style={styles.selector}
          onPress={() => setModalVisible(true)}
        >
          <Text>{fieldNumber ? `Поле №${fieldNumber}` : 'Выберите поле'}</Text>
        </TouchableOpacity>

        <Modal visible={modalVisible} animationType="slide">
          <View style={styles.modalContent}>
            <Text style={styles.label}>Выберите поле:</Text>
            <FlatList
              data={fields}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    setFieldNumber(item.number);
                    setModalVisible(false);
                  }}
                >
                  <Text>Поле №{item.number}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: 'white' }}>Отмена</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        <Text style={styles.label}>Дата:</Text>
        <Calendar
          onDayPress={(day) => setDate(day.dateString)}
          markedDates={{ [date]: { selected: true, selectedColor: '#1d1f1e' } }}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            selectedDayBackgroundColor: '#1d1f1e',
            selectedDayTextColor: '#FFFBD4',
            todayTextColor: '#d9534f',
            arrowColor: '#1d1f1e'
          }}
          style={styles.calendar}
        />

        <Text style={styles.label}>Время:</Text>
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
          ].map((slot) => (
            <TouchableOpacity
              key={slot}
              onPress={() => setTimeslot(slot)}
              style={[
                styles.slotButton,
                timeslot === slot && styles.selectedSlot
              ]}
            >
              <Text style={styles.slotText}>{slot}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Подтвердить бронирование</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
    position: 'absolute', top: 20, left: 0,
    backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingTop: 30,
    marginBottom: 20,
    marginLeft: 50,
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
    backgroundColor: '#1d1f1e',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
<<<<<<< HEAD
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    marginHorizontal: 20,
=======
    marginTop: 20
>>>>>>> 5e509252dbd5080c9ccb3b379becf9cebed321e1
  },
  submitButtonText: {
    color: '#FFFBD4',
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
  }
});
