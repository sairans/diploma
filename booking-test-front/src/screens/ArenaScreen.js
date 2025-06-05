import React, { useState } from 'react';
import axios from 'axios';
import { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function ArenaDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { venue } = route.params;

  const [tab, setTab] = useState('About');

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(0);
  const handleSubmitReview = async () => {
    try {
      const token = await AsyncStorage.getItem('token'); // 🔁 async
      if (!token) {
        Alert.alert('Ошибка', 'Вы не авторизованы');
        return;
      }

      await axios.post(
        `http://192.168.59.11:5001/api/reviews/`,
        {
          ground: venue._id,
          comment: newComment,
          rating: newRating
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      Alert.alert('Отзыв отправлен');
      setNewComment('');
      setNewRating(0);
    } catch (error) {
      console.error('Ошибка отправки отзыва:', error);
      Alert.alert('Ошибка при отправке отзыва');
    }
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(
          `http://192.168.59.11:5001/api/reviews/ground/${venue._id}`
        );
        setReviews(res.data.reviews);
        setRating(res.data.averageRating || 0);
      } catch (error) {
        console.error('Ошибка загрузки отзывов', error);
      }
    };

    fetchReviews();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View>
        <Image
          source={{ uri: venue.images?.[0] }}
          style={styles.image}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.topIcons}>
          <Ionicons name="share-social-outline" size={24} color="white" />
          <Ionicons name="heart-outline" size={24} color="white" />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{venue.name}</Text>
        <Text style={styles.sub}>football arena</Text>
        <Text style={styles.address}>📍 {venue.address}</Text>
        <Text style={styles.address}>₸ {venue.pricePerHour} тг/час</Text>
        <Text style={styles.address}>
          ⭐ {rating.toFixed(1)} · {reviews.length} ratings
        </Text>

        <View style={styles.socialRow}>
          <Ionicons name="logo-instagram" size={24} color="black" />
          <Ionicons
            name="call-outline"
            size={24}
            color="black"
            style={{ marginLeft: 20 }}
          />
        </View>

        <View style={styles.tabs}>
          {['About', 'Reviews', 'Photos'].map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={tab === t ? styles.activeTab : styles.tab}
            >
              <Text style={tab === t ? styles.activeTabText : styles.tabText}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'About' && (
          <View>
            <Text style={styles.label}>Conveniences</Text>
            <Text style={styles.text}>
              • Free Wi-Fi • Climate control • Changing room • Parking
            </Text>

            <Text style={styles.label}>About field</Text>
            <Text style={styles.text}>
              Size: 15x25 · Surface: grass · Fields: 3 · Balls: paid
            </Text>

            <Text style={styles.label}>Payment method</Text>
            <Text style={styles.text}>Cash · Kaspi QR · Payment card</Text>
          </View>
        )}

        {tab === 'Reviews' && (
          <View style={{ marginVertical: 20 }}>
            <Text style={styles.label}>Rate and write comment</Text>
            <View style={{ flexDirection: 'row', marginVertical: 10 }}>
              {[...Array(5)].map((_, i) => (
                <TouchableOpacity key={i} onPress={() => setNewRating(i + 1)}>
                  <Ionicons
                    name="star"
                    size={24}
                    color={i < newRating ? '#FFD700' : '#ccc'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              placeholder="Write a comment..."
              value={newComment}
              onChangeText={setNewComment}
              style={{
                borderColor: '#ccc',
                borderWidth: 1,
                padding: 10,
                borderRadius: 8,
                marginBottom: 10
              }}
              multiline
            />

            <TouchableOpacity
              style={{
                backgroundColor: '#3b82f6',
                padding: 10,
                borderRadius: 8,
                alignItems: 'center',
                marginBottom: 20
              }}
              onPress={handleSubmitReview}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                Send Review
              </Text>
            </TouchableOpacity>

            {reviews.length === 0 ? (
              <View style={{ alignItems: 'center' }}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={64}
                  color="#ccc"
                />
                <Text style={{ color: '#999', marginTop: 10 }}>
                  No comments yet
                </Text>
              </View>
            ) : (
              reviews.map((rev, idx) => (
                <View key={idx} style={{ marginBottom: 12 }}>
                  <Text style={{ fontWeight: 'bold' }}>{rev.user.name}</Text>
                  <Text style={{ color: '#555' }}>{rev.comment}</Text>
                  <Text style={{ color: '#999', fontSize: 12 }}>
                    ⭐ {rev.rating}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}

        {tab === 'Photos' && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {venue.images?.map((img, idx) => (
              <Image
                key={idx}
                source={{ uri: img }}
                style={{
                  width: '48%',
                  height: 100,
                  borderRadius: 10,
                  marginBottom: 10
                }}
              />
            ))}
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.reserveButton}
        onPress={() =>
          navigation.navigate('ReservationScreen', {
            groundId: venue._id,
            fields: venue.fields || []
          })
        }
      >
        <Text style={{ fontWeight: 'bold' }}>Make a reservation</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 0 },
  image: { width: '100%', height: 220 },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 20,
    zIndex: 10
  },
  topIcons: {
    position: 'absolute',
    right: 20,
    top: 40,
    flexDirection: 'row',
    gap: 20,
    zIndex: 10
  },
  content: { padding: 20 },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 2 },
  sub: { fontSize: 14, color: '#777' },
  address: { fontSize: 14, color: '#777', marginBottom: 4 },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  text: { fontSize: 14, marginTop: 4 },
  socialRow: { flexDirection: 'row', marginVertical: 10 },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20
  },
  tab: { paddingBottom: 6 },
  activeTab: { borderBottomWidth: 2, borderColor: '#000', paddingBottom: 6 },
  tabText: { color: '#888' },
  activeTabText: { fontWeight: 'bold', color: '#000' },
  reserveButton: {
    backgroundColor: '#FFFBD4',
    padding: 15,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center'
  }
});
