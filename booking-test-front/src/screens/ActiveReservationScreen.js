import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@env';

export default function ActiveReservationsScreen() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      const fetchReservations = async () => {
        try {
          setLoading(true);
          const response = await fetch('https://192.168.221.23:5001/');
          const data = await response.json();
          setReservations(data);
        } catch (error) {
          Alert.alert('Ошибка', 'Не удалось загрузить бронирования');
        } finally {
          setLoading(false);
        }
      };

      fetchReservations();
    }, [])
  );

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
    <View style={styles.container}>
      <Text style={styles.title}>Мои Бронирования</Text>
      {reservations.length === 0 ? (
        <Text>У вас нет активных бронирований</Text>
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
        />
      )}

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
          onPress={() => navigation.navigate('ActiveReservationScreen')}
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
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 100,
    flex: 1,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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
    elevation: 5
  },
  navButton: { alignItems: 'center' },
  navText: { fontSize: 12, color: '#000', marginTop: 4 }
});
