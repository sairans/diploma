import React, { useState, useCallback, useEffect } from 'react';
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
  const [activeTab, setActiveTab] = useState('active');
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      const fetchReservations = async () => {
        try {
          setLoading(true);
          const token = await AsyncStorage.getItem('token');
          const response = await fetch(
            `http://10.201.0.139:5001/api/bookings/my`,
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

  const handleDelete = (id) => {
    Alert.alert(
      'Подтвердите удаление',
      'Вы уверены, что хотите удалить бронирование?',
      [
        {
          text: 'Отмена',
          style: 'cancel'
        },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              await axios.delete(
                `http://10.201.0.139:5001/api/bookings/${id}`,
                {
                  headers: { Authorization: `Bearer ${token}` }
                }
              );
              setReservations((prev) => prev.filter((r) => r._id !== id));
              Alert.alert('Успешно', 'Бронирование удалено');
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось удалить');
            }
          }
        }
      ]
    );
  };

  const handleEdit = (item) => {
    navigation.navigate('EditReservationPage', {
      bookingId: item._id,
      groundId: item.ground._id,
      fields: item.ground.fields
    });
    console.log('Booking ID:', item._id);
    console.log('FIELDS:', item.ground.fields);
  };

  const today = new Date().toISOString().split('T')[0];
  const activeReservations = reservations.filter((r) => r.date >= today);
  const archivedReservations = reservations.filter((r) => r.date < today);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffeb24" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginBottom: 20,
          marginTop: Platform.OS === 'android' ? 10 : 40,
          borderBottomWidth: 1,
          borderColor: '#ddd'
        }}
      >
        {['active', 'archived'].map((tabKey) => (
          <TouchableOpacity
            key={tabKey}
            onPress={() => setActiveTab(tabKey)}
            style={{
              paddingVertical: 8,
              marginHorizontal: 16,
              borderBottomWidth: activeTab === tabKey ? 2 : 0,
              borderColor: '#000'
            }}
          >
            <Text
              style={{
                fontWeight: activeTab === tabKey ? 'bold' : 'normal',
                color: activeTab === tabKey ? '#000' : '#888'
              }}
            >
              {tabKey === 'active' ? 'Активные' : 'Архивные'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={
          activeTab === 'active' ? activeReservations : archivedReservations
        }
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.ground?.images?.[0] && (
              <Image
                source={{ uri: item.ground.images[0] }}
                style={styles.image}
              />
            )}
            <View style={styles.info}>
              <Text style={styles.field}>⚽ {item.ground?.name || '—'}</Text>
              <Text style={styles.detail}>Date: {item.date}</Text>
              <Text style={styles.detail}>Time: {item.timeSlot?.[0]}</Text>
              <Text style={styles.detail}>₸ {item.totalPrice || '—'} тг</Text>
              {activeTab === 'active' && (
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
              )}
            </View>
          </View>
        )}
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
