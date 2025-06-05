import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function Payments() {
  const navigation = useNavigation();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(
        'http://192.168.59.11:5001/api/users/payment',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setCards(response.data);
    } catch (error) {
      console.error('Failed to load cards', error);
    } finally {
      setLoading(false);
    }
  };

  const addCard = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const newCard = {
        cardholderName: 'John Doe',
        cardNumber: '**** **** **** ' + Math.floor(1000 + Math.random() * 9000),
        expiryDate: '12/30',
        brand: 'Visa'
      };

      await axios.put('http://192.168.59.11:5001/api/users/payment', newCard, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      Alert.alert('Success', 'Card added successfully');
      fetchCards();
    } catch (err) {
      Alert.alert('Error', 'Failed to add card');
    }
  };

  const deleteCard = async (id) => {
    Alert.alert('Confirm', 'Do you really want to delete this card?', [
      {
        text: 'Cancel',
        style: 'cancel'
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            await axios.delete(
              `http://192.168.59.11:5001/api/users/payment/${id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );
            Alert.alert('Deleted', 'Card removed');
            fetchCards();
          } catch (err) {
            Alert.alert('Error', 'Failed to delete card');
          }
        }
      }
    ]);
  };

  useEffect(() => {
    fetchCards();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Payment</Text>
      </View>

      <Image
        source={require('../../../assets/images/card.png')}
        style={styles.cardImage}
        resizeMode="contain"
      />

      <ScrollView contentContainerStyle={styles.cardList}>
        {loading ? (
          <Text style={{ textAlign: 'center', marginVertical: 20 }}>
            Loading...
          </Text>
        ) : cards.length === 0 ? (
          <Text style={styles.noCardsText}>No bank cards</Text>
        ) : (
          cards.map((card) => (
            <View key={card._id} style={styles.cardItem}>
              <Text style={styles.cardText}>
                {card.type} - {card.cardNumber}
              </Text>
              <TouchableOpacity onPress={() => deleteCard(card._id)}>
                <Ionicons name="trash" size={20} color="red" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={addCard}>
        <Text style={styles.addButtonText}>+ Add card</Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        We do not store or process bank data. All transactions are protected by
        AlanPay
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    marginTop: 30
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600'
  },
  cardImage: {
    width: '100%',
    height: 200,
    marginBottom: 10
  },
  noCardsText: {
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 16
  },
  cardList: {
    paddingBottom: 100
  },
  cardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f4f4f4',
    padding: 15,
    marginVertical: 5,
    borderRadius: 10
  },
  cardText: {
    fontSize: 16,
    fontWeight: '500'
  },
  addButton: {
    backgroundColor: '#fff9c4',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 10
  },
  addButtonText: {
    fontWeight: '600',
    color: '#000'
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#333'
  }
});
