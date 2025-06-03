import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Platform,
  Image
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
    navigation.navigate('EditReservationPage', {
      screen: 'EditReservationPage',
      params: { bookingId: item._id }
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {item.ground?.images?.[0] && (
        <Image source={{ uri: item.ground.images[0] }} style={styles.image} />
      )}
      <View style={styles.info}>
        <Text style={styles.field}>⚽ {item.ground?.name || '—'}</Text>
        <Text style={styles.detail}>Duration: 2 hours</Text>
        <Text style={styles.detail}>₸ 50,000 тг</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={() => handleDelete(item._id)}
            style={styles.cancelButton}
          >
            <Text style={{ color: 'white' }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleEdit(item)}
            style={styles.editButton}
          >
            <Text>Edit</Text>
          </TouchableOpacity>
        </View>
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
    <View style={styles.container}>
      <Text
        style={[
          styles.title,
          { marginTop: Platform.OS === 'android' ? 10 : 50 }
        ]}
      >
        Активные
      </Text>
      <FlatList
        data={reservations}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 20 : 0,
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
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: 10
  },
  info: {
    paddingHorizontal: 6
  },
  field: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4
  },
  detail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'flex-start'
  },
  cancelButton: {
    backgroundColor: '#F87171',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 12
  },
  editButton: {
    backgroundColor: '#FEF08A',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
