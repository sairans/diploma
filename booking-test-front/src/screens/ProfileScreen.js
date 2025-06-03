import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function ProfileScreen({ navigation }) {
  const route = useRoute();
  const { user: routeUser } = route.params || {};

  const [user, setUser] = useState({
    name: 'Anuarbek',
    phone: '+7-(778)-634-89-21',
    city: 'Astana',
    language: 'English',
    avatar: require('../../assets/images/icon.png')
  });

  useEffect(() => {
    if (routeUser) {
      setUser((prev) => ({
        ...prev,
        name: routeUser.name,
        phone: routeUser.phone
        // опционально можно добавить avatar, если он есть в объекте
      }));
    }
  }, [routeUser]);

  const MenuItem = ({ icon, label, value, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        <Icon name={icon} size={22} color="#333" />
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <View style={styles.menuRight}>
        {value && <Text style={styles.menuValue}>{value}</Text>}
        <Icon name="chevron-right" size={22} color="#aaa" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.headerImage}
        />

        <View style={styles.avatarContainer}>
          <Image source={user.avatar} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.username}>{user.name}</Text>
            <Text style={styles.phoneNumber}>{user.phone}</Text>
          </View>
        </View>

        <View style={styles.menuBlock}>
          <MenuItem icon="credit-card" label="Payment" />
          <MenuItem icon="translate" label="Language" value={user.language} />
          <MenuItem icon="map-marker" label="City" value={user.city} />
          <MenuItem icon="bell-ring-outline" label="Push Notifications" />
          <MenuItem icon="lock-reset" label="Change password" />
        </View>

        <View style={styles.menuBlock}>
          <MenuItem icon="headset" label="Support chat" />
          <MenuItem icon="handshake" label="Become a partner" />
          <MenuItem icon="information-outline" label="About the app" />
        </View>

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Icon name="logout" size={22} color="#ff3b30" />
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Нижняя навигация */}
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
          onPress={() => navigation.navigate('ProfileScreen', { user })}
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
    flex: 1,
    backgroundColor: '#fff'
  },
  headerImage: {
    width: '450%',
    height: 140,
    resizeMode: 'cover'
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    position: 'relative',
    top: -60
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 100,
    marginRight: 12,
    position: 'relative',
    top: -30
  },
  userInfo: {
    flexDirection: 'column'
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000'
  },
  phoneNumber: {
    fontSize: 16,
    color: '#555'
  },
  menuBlock: {
    backgroundColor: '#f9f9f9',
    marginVertical: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginHorizontal: 12
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomColor: '#eee',
    borderBottomWidth: 1
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  menuLabel: {
    marginLeft: 10,
    fontSize: 16
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  menuValue: {
    marginRight: 4,
    fontSize: 14,
    color: '#888'
  },
  signOutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 30,
    backgroundColor: '#ffecec',
    marginHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12
  },
  signOutText: {
    marginLeft: 6,
    fontSize: 16,
    color: '#ff3b30',
    fontWeight: '600'
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
  navButton: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: '#1d1f1e'
  }
});
