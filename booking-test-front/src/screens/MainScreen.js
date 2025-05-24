import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image, Animated } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

const venuesData = {
  Basketball: [
    { id: '1', name: 'Basketball arena', image: require('../../assets/images/Dopsy.png'), price: '25,000 тг/час', size: '15x25', address: 'Syganak 10/2' },
    { id: '2', name: 'Basketball arena', image: require('../../assets/images/Dopsy.png'), price: '1,000,000,000 тг/час', size: '19x56', address: 'Turan 1' },
    { id: '3', name: 'Basketball arena', image: require('../../assets/images/Dopsy.png'), price: '25,000 тг/час', size: '15x25', address: 'Syganak 10/2' },
    { id: '4', name: 'Basketball arena', image: require('../../assets/images/Dopsy.png'), price: '1,000,000,000 тг/час', size: '19x56', address: 'Turan 1' },
    { id: '5', name: 'Basketball arena', image: require('../../assets/images/Dopsy.png'), price: '25,000 тг/час', size: '15x25', address: 'Syganak 10/2' },
    { id: '6', name: 'Basketball arena', image: require('../../assets/images/Dopsy.png'), price: '1,000,000,000 тг/час', size: '19x56', address: 'Turan 1' },
  ],
  Football: [
    { id: '7', name: 'Football arena', image: require('../../assets/images/Dopsy.png'), price: '15,000 тг/ч', size: '10x20', address: 'Mangilik el 32/4' },
    { id: '8', name: 'Football arena', image: require('../../assets/images/Dopsy.png'), price: '15,000 тг/ч', size: '10x20', address: 'Mangilik el 32/4' },
    { id: '9', name: 'Football arena', image: require('../../assets/images/Dopsy.png'), price: '15,000 тг/ч', size: '10x20', address: 'Mangilik el 32/4' },
    { id: '10', name: 'Football arena', image: require('../../assets/images/Dopsy.png'), price: '15,000 тг/ч', size: '10x20', address: 'Mangilik el 32/4' },
    { id: '11', name: 'Football arena', image: require('../../assets/images/Dopsy.png'), price: '15,000 тг/ч', size: '10x20', address: 'Mangilik el 32/4' }
  ],
  Volleyball: [
    { id: '12', name: 'Volleyball arena', image: require('../../assets/images/Dopsy.png'), price: '15,000 тг/ч', size: '10x20', address: 'Mangilik el 32/4' },
    { id: '13', name: 'Volleyball arena', image: require('../../assets/images/Dopsy.png'), price: '15,000 тг/ч', size: '10x20', address: 'Mangilik el 32/4' },
    { id: '14', name: 'Volleyball arena', image: require('../../assets/images/Dopsy.png'), price: '15,000 тг/ч', size: '10x20', address: 'Mangilik el 32/4' },
  ],
  Tennis: [
    { id: '15', name: 'Tennis arena', image: require('../../assets/images/Dopsy.png'), price: '15,000 тг/ч', size: '10x20', address: 'Mangilik el 32/4' },
    { id: '16', name: 'Tennis arena', image: require('../../assets/images/Dopsy.png'), price: '15,000 тг/ч', size: '10x20', address: 'Mangilik el 32/4' }
  ],
  Hockey: [
    { id: '17', name: 'Hockey arena', image: require('../../assets/images/Dopsy.png'), price: '15,000 тг/ч', size: '10x20', address: 'Mangilik el 32/4' },
  ],
};

export default function MainScreen() {
  const [selectedSport, setSelectedSport] = useState(null);
  const [heightAnim] = useState(new Animated.Value(150)); // Начальная высота блока

  const handleSportSelect = (sport) => {
    const isSelected = selectedSport === sport;
    setSelectedSport(isSelected ? null : sport);

    // Анимация изменения высоты блока
    Animated.timing(heightAnim, {
      toValue: isSelected ? 150 : 520, // Маленький — 100, большой — 320
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.container}>
      {/* Карта */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 51.1694,
          longitude: 71.4491,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker coordinate={{ latitude: 51.1694, longitude: 71.4491 }} title="Astana" />
      </MapView>

      {/* Белый блок с поиском и фильтрами */}
      <Animated.View style={[styles.searchAndFilterContainer, { height: heightAnim }]}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#555" style={styles.icon} />
          <TextInput style={styles.searchInput} placeholder="Search..." placeholderTextColor="#777" />
          <Ionicons name="menu" size={24} color="#555" />
        </View>

        <View style={styles.filters}>
          {Object.keys(venuesData).map((sport) => (
            <TouchableOpacity
              key={sport}
              style={[styles.filterButton, selectedSport === sport && styles.activeFilter]}
              onPress={() => handleSportSelect(sport)}
            >
              <Text style={styles.filterText}>{sport}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Карточки арен */}
        {selectedSport && (
          <FlatList
            data={venuesData[selectedSport]}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Image source={item.image} style={styles.venueImage} />
                <View style={styles.cardDetails}>
                  <Text style={styles.venueName}>{item.name}</Text>
                  <Text style={styles.venueInfo}>Address: {item.address}</Text>
                  <Text style={styles.venueInfo}>Prise: {item.price}</Text>
                  <Text style={styles.venueInfo}>Size: {item.size}</Text>
                </View>
              </View>
            )}
          />
        )}
      </Animated.View>

      {/* Нижняя навигация */}
      <View style={styles.bottomNav}>
        {[
          { icon: 'home', label: 'Home' },
          { icon: 'calendar', label: 'Reservations' },
          { icon: 'newspaper', label: 'Posts' },
          { icon: 'person', label: 'Profile' },
        ].map((item, index) => (
          <TouchableOpacity key={index} style={styles.navButton}>
            <Ionicons name={item.icon} size={24} color="#1d1f1e" />
            <Text style={styles.navText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  map: { height: '79%' },

  searchAndFilterContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    backgroundColor: '#dadada',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 10,
    elevation: 5,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  icon: { marginRight: 10,},
  searchInput: { flex: 1, fontSize: 16 },

  filters: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  filterButton: {
    fontFamily: 'Jura',
    backgroundColor: '#f1f1f1',
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 10
  },
  activeFilter: { 
    backgroundColor: '#9d9d9d',
  },
  activeText: {
    color: '#fff'
  },
  filterText: { fontSize: 14, color: 'black'},

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    elevation: 3,
  },
  venueImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 10,
  },
  cardDetails: { flex: 1 },
  venueName: { fontSize: 16, fontWeight: 'bold' },
  venueInfo: { fontSize: 14, color: '#555' },

  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 0,
    elevation: 5,
  },
  navButton: { alignItems: 'center' },
  navText: { fontSize: 12, color: '#000', marginTop: 4 },
});
