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
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [language, setLanguage] = useState('English');
  const [city, setCity] = useState('Astana');

  useFocusEffect(
    useCallback(() => {
      const fetchUser = async () => {
        try {
          const token = await AsyncStorage.getItem('token');
          const response = await axios.get(
            'http://10.201.0.139:5001/api/users/me',
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
          <MenuItem
            icon="translate"
            label="Language"
            value={language}
            onPress={() => setLanguageModalVisible(true)}
          />
          <MenuItem
            icon="map-marker"
            label="City"
            value={city}
            onPress={() => setCityModalVisible(true)}
          />
          <MenuItem
            icon="bell-ring-outline"
            label="Push Notifications"
            onPress={() => navigation.navigate('PushNotifications')}
          />
          <MenuItem
            icon="lock-reset"
            label="Change password"
            onPress={() => navigation.navigate('ChangePassword')}
          />
          {user.isAdmin && (
            <MenuItem
              icon="view-dashboard"
              label="Dashboard"
              onPress={() => navigation.navigate('Dashboard')}
            />
          )}
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
      {languageModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Language</Text>
            {['English', 'Russian', 'Kazakh'].map((lang) => (
              <TouchableOpacity
                key={lang}
                style={styles.modalItem}
                onPress={() => {
                  setLanguage(lang);
                  setLanguageModalVisible(false);
                }}
              >
                <Text style={styles.modalText}>{lang}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setLanguageModalVisible(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {cityModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select City</Text>
            {['Astana', 'Almaty'].map((c) => (
              <TouchableOpacity
                key={c}
                style={styles.modalItem}
                onPress={() => {
                  setCity(c);
                  setCityModalVisible(false);
                }}
              >
                <Text style={styles.modalText}>{c}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setCityModalVisible(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20
  },
  modalItem: {
    paddingVertical: 10
  },
  modalText: {
    fontSize: 16
  },
  modalCancel: {
    marginTop: 20,
    color: 'red'
  }
});
