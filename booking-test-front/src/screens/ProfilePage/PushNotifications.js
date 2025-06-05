import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const PushNotifications = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([
    '✅ Booking confirmed: Field #2 on June 5 at 16:00.',
    '📩 Payment received via Kaspi.',
    '⏰ Reminder: Your reservation starts in 30 minutes.'
  ]);

  const clearNotifications = () => {
    Alert.alert(
      'Clear All',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => setNotifications([])
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Push Notifications</Text>
        <TouchableOpacity onPress={clearNotifications}>
          <Ionicons name="trash" size={24} color="#ff4d4d" />
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <ScrollView contentContainerStyle={styles.list}>
        {notifications.length === 0 ? (
          <Text style={styles.empty}>No notifications</Text>
        ) : (
          notifications.map((note, idx) => (
            <View key={idx} style={styles.notification}>
              <Text style={styles.notificationText}>{note}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  list: {
    paddingHorizontal: 20,
    paddingVertical: 20
  },
  notification: {
    backgroundColor: '#f4f4f4',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10
  },
  notificationText: {
    color: '#333',
    fontSize: 14
  },
  empty: {
    textAlign: 'center',
    color: '#aaa',
    marginTop: 50
  }
});

export default PushNotifications;
