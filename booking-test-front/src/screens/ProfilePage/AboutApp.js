import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function AboutApp() {
  const navigation = useNavigation();

  const handleShare = () => {
    Alert.alert('Share', 'Share the app with friends');
  };

  const handleRate = () => {
    Linking.openURL('market://details?id=com.alan.sports');
  };

  const handleWebsite = () => {
    Linking.openURL('https://alan-sports.com');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>About the app</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.appName}>ALAN APP</Text>
        <Text style={styles.version}>VERSION 0.0.1</Text>

        <Text style={styles.title}>
          Alan – Easy Online Booking for Sports Venues
        </Text>
        <Text style={styles.description}>
          Looking for a place to play? Alan lets you quickly book sports venues
          in Astana and Almaty. Choose from a wide range of facilities for
          football, basketball, tennis, volleyball, and more!
        </Text>

        <Text style={styles.subtitle}>Why Alan?</Text>

        <View style={styles.feature}>
          <Ionicons name="checkmark" size={20} color="#4CAF50" />
          <Text style={styles.featureText}>
            Wide selection – venues for various sports in convenient locations.
          </Text>
        </View>

        <View style={styles.feature}>
          <Ionicons name="checkmark" size={20} color="#4CAF50" />
          <Text style={styles.featureText}>
            Easy booking – pick a date, time, and book in seconds.
          </Text>
        </View>

        <View style={styles.feature}>
          <Ionicons name="checkmark" size={20} color="#4CAF50" />
          <Text style={styles.featureText}>
            Up-to-date info – check prices, availability, and conditions in real
            time.
          </Text>
        </View>

        <View style={styles.feature}>
          <Ionicons name="checkmark" size={20} color="#4CAF50" />
          <Text style={styles.featureText}>
            Secure payment – hassle-free online payments.
          </Text>
        </View>

        <Text style={styles.callToAction}>
          Book your sports venue now with Alan!
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-social" size={20} color="#333" />
            <Text style={styles.actionText}>Share the app</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleRate}>
            <Ionicons name="star" size={20} color="#333" />
            <Text style={styles.actionText}>Rate the app</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleWebsite}>
            <Ionicons name="globe" size={20} color="#333" />
            <Text style={styles.actionText}>Go to website</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.legalText}>Terms of Use of Maps</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    marginTop: 30
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600'
  },
  content: {
    paddingBottom: 20
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5
  },
  version: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    color: '#333'
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 15,
    marginTop: 10
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10
  },
  featureText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
    color: '#333'
  },
  callToAction: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 25,
    marginBottom: 30,
    textAlign: 'center'
  },
  actions: {
    gap: 15,
    marginBottom: 30
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8
  },
  actionText: {
    fontSize: 16
  },
  legalText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 20
  }
});
