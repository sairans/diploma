import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  FlatList,
  Alert
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function ReservationPage() {
  const route = useRoute();
  const navigation = useNavigation();
  const { groundId, fields } = route.params;

  const [fieldNumber, setFieldNumber] = useState(fields[0]?.number || '');
  const [date, setDate] = useState('');
  const [timeslot, setTimeslot] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const handleSubmit = () => {
    if (!groundId || !date || !timeslot) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    Alert.alert(
      'Успех',
      `Арендовано поле №${fieldNumber} на ${date}, время: ${timeslot}`
    );

    // Здесь можно сделать POST-запрос
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Поле:</Text>

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
      <TextInput
        placeholder="например, 2025-06-01"
        value={date}
        onChangeText={setDate}
        style={styles.input}
      />

      <Text style={styles.label}>Время:</Text>
      <TextInput
        placeholder="например, 14:00–15:00"
        value={timeslot}
        onChangeText={setTimeslot}
        style={styles.input}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Подтвердить бронирование</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  selector: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: '#1d1f1e',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#FFFBD4',
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 20,
    marginTop: 50,
    flex: 1,
  },
  option: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  cancelButton: {
    marginTop: 20,
    backgroundColor: '#d9534f',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});
