import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function ArenaDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { venue } = route.params;

  const [tab, setTab] = useState('About');

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
        <Text style={styles.address}>⭐ 9.3 · 58 ratings</Text>

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
          <View style={{ alignItems: 'center', marginVertical: 20 }}>
            <Text style={styles.label}>Rate and write comment</Text>
            <View style={{ flexDirection: 'row', marginVertical: 10 }}>
              {[...Array(5)].map((_, i) => (
                <Ionicons
                  key={i}
                  name="star-outline"
                  size={24}
                  color="#FFD700"
                />
              ))}
            </View>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={64}
              color="#ccc"
            />
            <Text style={{ color: '#999', marginTop: 10 }}>
              No comments yet
            </Text>
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
