import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function ActiveReservationsScreen() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      const fetchReservations = async () => {
        try {
          setLoading(true);
          const token = await AsyncStorage.getItem('token');
          const response = await fetch(
            `http://172.20.10.5:5001/api/bookings/my`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          const data = await response.json();
          setReservations(data.bookings);
        } catch (error) {
          Alert.alert('Ошибка', 'Не удалось загрузить данные');
        } finally {
          setLoading(false);
        }
      };

      fetchReservations();
    }, [])
  );

  const handleDelete = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(`http://172.20.10.5:5001/api/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReservations((prev) => prev.filter((r) => r._id !== id));
      Alert.alert('Успешно', 'Бронирование удалено');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось удалить');
    }
  };

  const handleEdit = (item) => {
    navigation.navigate('BookingEditScreen', { booking: item });
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.field}>Площадка: {item.ground?.name || '—'}</Text>
      <Text>Поле №: {item.fieldNumber}</Text>
      <Text>Дата: {new Date(item.date).toLocaleDateString()}</Text>
      <Text>
        Время:{' '}
        {Array.isArray(item.timeSlot)
          ? item.timeSlot.join(', ')
          : item.timeSlot}
      </Text>
      <View style={{ flexDirection: 'row', marginTop: 10 }}>
        <TouchableOpacity
          style={{ marginRight: 10 }}
          onPress={() => handleEdit(item)}
        >
          <Text style={{ color: 'blue' }}>Изменить</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item._id)}>
          <Text style={{ color: 'red' }}>Удалить</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text
          style={[
            styles.title,
            { marginTop: Platform.OS === 'android' ? 20 : 50 }
          ]}
        >
          Активные
        </Text>
        <FlatList
          data={reservations}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
        />

        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('Main')}
          >
            <Ionicons name="home" size={24} color="#1d1f1e" />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setShowReservations(!showReservations)}
          >
            <Ionicons name="calendar" size={24} color="#1d1f1e" />
            <Text style={styles.navText}>Reservations</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => console.log('Posts')}
          >
            <Ionicons name="newspaper" size={24} color="#1d1f1e" />
            <Text style={styles.navText}>Posts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('ProfileScreen')} // заменили
          >
            <Ionicons name="person" size={24} color="#1d1f1e" />
            <Text style={styles.navText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    padding: 10,
    paddingBottom: 100, // чтобы контент не перекрывался навигацией
    flex: 1,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingTop: 32,
    marginBottom: 20
  },
  item: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10
  },
  field: {
    fontWeight: 'bold'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  bottomNav: {
    paddingBottom: 32,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 0,
    elevation: 5
  },
  navButton: { alignItems: 'center' },
  navText: { fontSize: 12, color: '#000', marginTop: 4 }
});
