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

  const [user, setUser] = useState({});

  useFocusEffect(
    useCallback(() => {
      const fetchUser = async () => {
        try {
          const token = await AsyncStorage.getItem('token');
          const response = await axios.get(
            'http://192.168.59.11:5001/api/users/me',
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          setUser(response.data);
        } catch (err) {
          console.error('Ошибка получения данных пользователя:', err.message);
        }
      };

      fetchUser();
    }, [])
  );

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
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.headerImage}
        />

        <View style={styles.avatarContainer}>
          <Image
            source={
              user.avatar
                ? typeof user.avatar === 'string'
                  ? { uri: user.avatar }
                  : user.avatar
                : require('../../assets/images/icon.png')
            }
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.username}>{user.name}</Text>
            <Text style={styles.phoneNumber}>{user.phone}</Text>
          </View>
        </View>

        <View style={styles.menuBlock}>
          <MenuItem
            icon="credit-card"
            label="Payment"
            onPress={() => navigation.navigate('Payments')}
          />
          <MenuItem icon="translate" label="Language" value={'English'} />
          <MenuItem icon="map-marker" label="City" value={'Astana'} />
          <MenuItem icon="bell-ring-outline" label="Push Notifications" />
          <MenuItem icon="lock-reset" label="Change password" />
        </View>

        <View style={styles.secondMenuBlock}>
          <MenuItem
            icon="headset"
            label="Support chat"
            onPress={() => navigation.navigate('BecomePartner')}
          />
          <MenuItem
            icon="handshake"
            label="Become a partner"
            onPress={() => navigation.navigate('SupportChat')}
          />
          <MenuItem
            icon="information-outline"
            label="About the app"
            onPress={() => navigation.navigate('AboutApp')}
          />
        </View>

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Icon name="logout" size={22} color="#ff3b30" />
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
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
    marginTop: -70,
    backgroundColor: '#f9f9f9',
    marginVertical: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginHorizontal: 12
  },
  secondMenuBlock: {
    marginTop: 10,
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
  }
});
