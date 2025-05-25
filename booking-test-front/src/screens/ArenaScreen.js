import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';


export default function ArenaDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { venue } = route.params;

  const handleBooking = () => {
    Alert.alert('Бронирование', `Вы выбрали арену: ${venue.name}`);
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: venue.images?.[0] }}
        style={styles.image}
        resizeMode="cover"
      />

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.name}>{venue.name}</Text>
        <Text style={styles.address}>{venue.address}</Text>

        <Text style={styles.label}>Описание:</Text>
        <Text style={styles.text}>{venue.description || 'Нет описания'}</Text>

        <Text style={styles.label}>Цена:</Text>
        <Text style={styles.text}>{venue.pricePerHour} тг/час</Text>

        <Text style={styles.label}>Часы работы:</Text>
        <Text style={styles.text}>{venue.availableHours?.start} - {venue.availableHours?.end}</Text>

        <Text style={styles.label}>Доступные дни:</Text>
        <Text style={styles.text}>{venue.availableWeekdays?.join(', ')}</Text>

        <TouchableOpacity
  style={{
    backgroundColor: '#FDE047',
    padding: 15,
    margin: 15,
    borderRadius: 10,
    alignItems: 'center',
  }}
  onPress={() => navigation.navigate('ReservationScreen', {
    groundId: venue._id,
    fields: venue.fields || [],
  })}
>
  <Text style={{ fontWeight: 'bold' }}>Забронировать</Text>
</TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: '100%', height: 200 },
  backButton: {
    position: 'absolute', top: 40, left: 20,
    backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 20
  },
  content: { padding: 20 },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  address: { fontSize: 14, color: '#777', marginBottom: 10 },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  text: { fontSize: 14, marginTop: 4 },
  button: {
    backgroundColor: '#1d1f1e', marginTop: 20,
    padding: 15, borderRadius: 10, alignItems: 'center'
  },
  buttonText: {
    color: '#FFFBD4', fontSize: 16, fontWeight: 'bold'
  }
});