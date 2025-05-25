import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Animated,
  ActivityIndicator
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

export default function MainScreen() {
  const navigation = useNavigation();
  const [grounds, setGrounds] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [heightAnim] = useState(new Animated.Value(150));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrounds = async () => {
      try {
        const res = await axios.get('http://192.168.160.191:5001/api/grounds');
        setGrounds(res.data.grounds);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrounds();
  }, []);

  const handleSportSelect = (type) => {
    const isSelected = selectedType === type;
    setSelectedType(isSelected ? null : type);

    Animated.timing(heightAnim, {
      toValue: isSelected ? 150 : 520,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const uniqueTypes = [...new Set(grounds.map((g) => g.type))];
  const filteredGrounds = selectedType
    ? grounds.filter((g) => g.type === selectedType)
    : [];

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 51.1694,
          longitude: 71.4491,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {grounds.map((ground) => (
          <Marker
            key={ground._id}
            coordinate={{
              latitude: ground.location.coordinates[1],
              longitude: ground.location.coordinates[0],
            }}
            title={ground.name}
            description={ground.address}
          />
        ))}
      </MapView>

      <Animated.View style={[styles.searchAndFilterContainer, { height: heightAnim }]}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#555" style={styles.icon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#777"
          />
          <Ionicons name="menu" size={24} color="#555" />
        </View>

        <View style={styles.filters}>
          {uniqueTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.filterButton, selectedType === type && styles.activeFilter]}
              onPress={() => handleSportSelect(type)}
            >
              <Text style={styles.filterText}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#000" />
        ) : (
          selectedType && (
            <FlatList
              data={filteredGrounds}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => navigation.navigate('ArenaDetails', { venue: item })}
                >
                  <Image
                    source={{ uri: item.images?.[0] }}
                    style={styles.venueImage}
                  />
                  <View style={styles.cardDetails}>
                    <Text style={styles.venueName}>{item.name}</Text>
                    <Text style={styles.venueInfo}>Address: {item.address}</Text>
                    <Text style={styles.venueInfo}>Price: {item.pricePerHour} тг/час</Text>
                    <Text style={styles.venueInfo}>Available: {item.available ? 'Yes' : 'No'}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )
        )}
      </Animated.View>

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
    position: 'absolute', bottom: 65, left: 0, right: 0,
    backgroundColor: '#dadada', borderRadius: 15,
    paddingHorizontal: 10, paddingVertical: 10, elevation: 5,
  },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f1f1f1', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 8, marginBottom: 10,
  },
  icon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16 },
  filters: {
    flexDirection: 'row', justifyContent: 'space-around',
  },
  filterButton: {
    backgroundColor: '#f1f1f1', borderRadius: 15,
    paddingVertical: 6, paddingHorizontal: 12, marginBottom: 10
  },
  activeFilter: { backgroundColor: '#9d9d9d' },
  filterText: { fontSize: 14, color: 'black',},
  card: {
    backgroundColor: '#fff', borderRadius: 12,
    marginVertical: 7, flexDirection: 'row', alignItems: 'center',
    padding: 10, elevation: 3,
  },
  venueImage: {
    width: 120, height: 120, borderRadius: 8, marginRight: 10,
  },
  cardDetails: { flex: 1 },
  venueName: { fontSize: 16, fontWeight: 'bold' },
  venueInfo: { fontSize: 14, color: '#555' },
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
    elevation: 5,
  },
  navButton: { alignItems: 'center' },
  navText: { fontSize: 12, color: '#000', marginTop: 4 },
});