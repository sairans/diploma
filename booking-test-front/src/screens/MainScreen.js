import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  TextInput,
  ActivityIndicator,
  PanResponder
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import exampleImage from '../../assets/images/icon.png';

export default function MainScreen() {
  const navigation = useNavigation();
  const [grounds, setGrounds] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [heightAnim] = useState(new Animated.Value(150));
  const [loading, setLoading] = useState(true);

  // useFocusEffect(
  //   React.useCallback(() => {
  //     const parent = navigation.getParent();
  //     parent?.setOptions({ tabBarStyle: { display: 'none' } });

  //     return () => {
  //       parent?.setOptions({ tabBarStyle: undefined });
  //     };
  //   }, [navigation])
  // );

  useEffect(() => {
    const fetchGrounds = async () => {
      try {
        const res = await axios.get('http://192.168.59.11:5001/api/grounds');
        setGrounds(res.data.grounds);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrounds();
  }, []);

  // PanResponder for swipe up/down on panel
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dy) > 10;
    },
    onPanResponderMove: (_, gestureState) => {
      const newHeight = Math.max(
        150,
        Math.min(520, heightAnim._value - gestureState.dy)
      );
      heightAnim.setValue(newHeight);
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy < -50) {
        Animated.timing(heightAnim, {
          toValue: 520,
          duration: 200,
          useNativeDriver: false
        }).start();
      } else if (gestureState.dy > 50) {
        Animated.timing(heightAnim, {
          toValue: 150,
          duration: 200,
          useNativeDriver: false
        }).start();
      }
    }
  });

  const handleSportSelect = (type) => {
    const isSelected = selectedType === type;
    setSelectedType(isSelected ? null : type);

    Animated.timing(heightAnim, {
      toValue: isSelected ? 150 : 520,
      duration: 300,
      useNativeDriver: false
    }).start();
  };

  const uniqueTypes = [...new Set(grounds.map((g) => g.type))];
  const filteredGrounds = selectedType
    ? grounds.filter((g) => g.type === selectedType)
    : [];

  return (
    <View style={styles.container}>
      {/* Top bar with icons */}
      <View style={styles.topBar}>
        <View style={styles.cityContainer}>
          <Ionicons name="location-sharp" size={18} color="#000" />
          <Text style={styles.cityText}>Astana</Text>
        </View>
        <Ionicons name="notifications-outline" size={24} color="#000" />
      </View>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 51.1694,
          longitude: 71.4491,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05
        }}
      >
        {grounds.map((ground) => (
          <Marker
            key={ground._id}
            coordinate={{
              latitude: ground.location.coordinates[1],
              longitude: ground.location.coordinates[0]
            }}
            title={ground.name}
            description={ground.address}
          />
        ))}
      </MapView>

      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.searchAndFilterContainer, { height: heightAnim }]}
      >
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#555" style={styles.icon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#777"
          />
        </View>

        <View style={styles.filters}>
          {uniqueTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterButton,
                selectedType === type && styles.activeFilter
              ]}
              onPress={() => handleSportSelect(type)}
            >
              <Text style={styles.filterText}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#000" />
        ) : (
          <FlatList
            data={selectedType ? filteredGrounds : grounds}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  navigation.navigate('ArenaDetails', { venue: item })
                }
              >
                {item.images?.[0] ? (
                  <Image
                    source={{ uri: item.images[0] }}
                    style={styles.venueImage}
                    contentFit="cover"
                  />
                ) : (
                  <View style={[styles.venueImage, styles.placeholder]}>
                    <Text>Нет фото</Text>
                  </View>
                )}
                <View style={styles.cardDetails}>
                  <Text style={styles.venueName}>{item.name}</Text>
                  <Text style={styles.venueInfo}>Address: {item.address}</Text>
                  <Text style={styles.venueInfo}>
                    Price: {item.pricePerHour} тг/час
                  </Text>
                  <Text style={styles.venueInfo}>
                    Available: {item.available ? 'Yes' : 'No'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  map: { height: '79%' },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffffcc',
    padding: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4
  },
  cityContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  cityText: {
    fontSize: 16,
    marginLeft: 6,
    fontWeight: '500'
  },
  searchAndFilterContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f8f8f8',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    elevation: 10
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10
  },
  icon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16 },
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: 10
  },
  filterButton: {
    backgroundColor: '#f1f1f1',
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 10
  },
  activeFilter: { backgroundColor: '#9d9d9d' },
  filterText: { fontSize: 14, color: 'black' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    elevation: 3
  },
  venueImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 10
  },
  cardDetails: { flex: 1 },
  venueName: { fontSize: 16, fontWeight: 'bold' },
  venueInfo: { fontSize: 14, color: '#555' }
});
