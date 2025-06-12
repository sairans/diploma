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
  PanResponder,
  BackHandler
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
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation.getParent();
      parent?.setOptions({ gestureEnabled: false });

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => true
      );

      return () => {
        parent?.setOptions({ gestureEnabled: true });
        backHandler.remove();
      };
    }, [navigation])
  );

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
        const res = await axios.get('http://10.201.0.139:5001/api/grounds');
        setGrounds(res.data.grounds);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrounds();
  }, []);

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

  const baseGrounds = selectedType ? filteredGrounds : grounds;
  const displayedGrounds = searchQuery
    ? baseGrounds.filter((g) =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : baseGrounds;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.cityContainer}>
          <Ionicons name="location-sharp" size={18} color="#000" />
          <Text style={styles.cityText}>Astana</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('PushNotifications')}
        >
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
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
            value={searchQuery}
            onChangeText={setSearchQuery}
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
            data={displayedGrounds}
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
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  map: {
    height: '90%'
  },
  topBar: {
    position: 'absolute',
    top: 60,
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
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 34,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 15
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2
  },
  icon: {
    marginRight: 12,
    opacity: 0.6
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '400'
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 8
  },
  filterButton: {
    backgroundColor: '#f1f3f4',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e8eaed',
    minWidth: 70,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  activeFilter: {
    backgroundColor: '#FFFBD4',
    borderColor: '#FFFBD4'
  },
  filterText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500'
  },
  activeFilterText: {
    color: '#ffffff',
    fontWeight: '600'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0'
  },
  venueImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 12
  },
  cardDetails: {
    flex: 1
  },
  venueName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4
  },
  venueInfo: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20
  }
});
