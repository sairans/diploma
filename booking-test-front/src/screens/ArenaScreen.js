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
import { Linking } from 'react-native';
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
        `http://10.201.0.139:5001/api/reviews/`,
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
          `http://10.201.0.139:5001/api/reviews/ground/${venue._id}`
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Image Section */}
      <View style={styles.heroSection}>
        <Image
          source={{ uri: venue.images?.[0] }}
          style={styles.heroImage}
          resizeMode="cover"
        />

        {/* Gradient Overlay */}
        <View style={styles.gradientOverlay} />

        {/* Header Controls */}
        <View style={styles.headerControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={22} color="white" />
          </TouchableOpacity>

          <View style={styles.rightControls}>
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="share-outline" size={20} color="white" />
            </TouchableOpacity>
            {/* Like button */}
            {(() => {
              const [liked, setLiked] = React.useState(false);
              return (
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => setLiked(!liked)}
                >
                  <Ionicons
                    name={liked ? 'heart' : 'heart-outline'}
                    size={20}
                    color={liked ? 'red' : 'white'}
                  />
                </TouchableOpacity>
              );
            })()}
          </View>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.contentContainer}>
        {/* Venue Info Card */}
        <View style={styles.venueInfoCard}>
          <View style={styles.venueHeader}>
            <View style={styles.venueMainInfo}>
              <Text style={styles.venueName}>{venue.name}</Text>
              <View style={styles.venueTypeContainer}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>football arena</Text>
                </View>
              </View>

              <View style={styles.venueMetrics}>
                <View style={styles.metricItem}>
                  <Ionicons name="location" size={16} color="#666" />
                  <Text style={styles.metricText}>{venue.address}</Text>
                </View>
                <View style={styles.metricItem}>
                  <Ionicons name="card" size={16} color="#666" />
                  <Text style={styles.metricText}>
                    ₸ {venue.pricePerHour} тг/час
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.metricText}>
                    {rating.toFixed(1)} · {reviews.length} ratings
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                if (venue.contacts?.instagram) {
                  Linking.openURL(venue.contacts.instagram);
                }
              }}
            >
              <Ionicons name="logo-instagram" size={20} color="#E4405F" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                if (venue.contacts?.phone) {
                  Linking.openURL(`tel:${venue.contacts.phone}`);
                }
              }}
            >
              <Ionicons name="call" size={20} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble" size={20} color="#34C759" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Navigation Tabs */}
        <View style={styles.tabsContainer}>
          {['About', 'Reviews', 'Photos'].map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={[styles.tabButton, tab === t && styles.activeTabButton]}
            >
              <Text style={[styles.tabText, tab === t && styles.activeTabText]}>
                {t}
              </Text>
              {tab === t && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {tab === 'About' && (
            <View>
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Conveniences</Text>
                <View style={styles.amenitiesGrid}>
                  {[
                    'Free Wi-Fi',
                    'Climate control',
                    'Changing room',
                    'Parking'
                  ].map((amenity, index) => (
                    <View key={index} style={styles.amenityItem}>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color="#34C759"
                      />
                      <Text style={styles.amenityText}>{amenity}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Field Details</Text>
                <View style={styles.fieldDetailsGrid}>
                  <View style={styles.fieldDetail}>
                    <Text style={styles.fieldDetailLabel}>Size</Text>
                    <Text style={styles.fieldDetailValue}>
                      {venue.info?.size || '—'}
                    </Text>
                  </View>
                  <View style={styles.fieldDetail}>
                    <Text style={styles.fieldDetailLabel}>Surface</Text>
                    <Text style={styles.fieldDetailValue}>
                      {venue.info?.cover || '—'}
                    </Text>
                  </View>
                  <View style={styles.fieldDetail}>
                    <Text style={styles.fieldDetailLabel}>Fields</Text>
                    <Text style={styles.fieldDetailValue}>
                      {venue.fields?.length || 0}
                    </Text>
                  </View>
                  <View style={styles.fieldDetail}>
                    <Text style={styles.fieldDetailLabel}>Balls</Text>
                    <Text style={styles.fieldDetailValue}>
                      {venue.info?.balls || '—'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Payment Methods</Text>
                <View style={styles.paymentMethods}>
                  {['Cash', 'Kaspi QR', 'Payment card'].map((method, index) => (
                    <View key={index} style={styles.paymentMethod}>
                      <Ionicons name="card" size={16} color="#f5e43d" />
                      <Text style={styles.paymentMethodText}>{method}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {tab === 'Reviews' && (
            <View>
              {/* Review Form */}
              <View style={styles.reviewForm}>
                <Text style={styles.sectionTitle}>Rate and Review</Text>
                <View style={styles.starRating}>
                  {[...Array(5)].map((_, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => setNewRating(i + 1)}
                    >
                      <Ionicons
                        name="star"
                        size={28}
                        color={i < newRating ? '#FFD700' : '#E5E5E5'}
                        style={styles.starIcon}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  placeholder="Share your experience..."
                  value={newComment}
                  onChangeText={setNewComment}
                  style={styles.commentInput}
                  multiline
                  numberOfLines={4}
                />

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmitReview}
                >
                  <Text style={styles.submitButtonText}>Submit Review</Text>
                </TouchableOpacity>
              </View>

              {/* Reviews List */}
              <View style={styles.reviewsList}>
                {reviews.length === 0 ? (
                  <View style={styles.emptyReviews}>
                    <Ionicons
                      name="chatbubbles-outline"
                      size={48}
                      color="#C7C7CC"
                    />
                    <Text style={styles.emptyReviewsText}>No reviews yet</Text>
                    <Text style={styles.emptyReviewsSubtext}>
                      Be the first to share your experience!
                    </Text>
                  </View>
                ) : (
                  reviews.map((rev, idx) => (
                    <View key={idx} style={styles.reviewItem}>
                      <View style={styles.reviewHeader}>
                        <View style={styles.reviewerAvatar}>
                          <Text style={styles.reviewerInitial}>
                            {rev.user.name[0]}
                          </Text>
                        </View>
                        <View style={styles.reviewerInfo}>
                          <Text style={styles.reviewerName}>
                            {rev.user.name}
                          </Text>
                          <View style={styles.reviewRating}>
                            {[...Array(5)].map((_, i) => (
                              <Ionicons
                                key={i}
                                name="star"
                                size={12}
                                color={i < rev.rating ? '#FFD700' : '#E5E5E5'}
                              />
                            ))}
                          </View>
                        </View>
                      </View>
                      <Text style={styles.reviewComment}>{rev.comment}</Text>
                    </View>
                  ))
                )}
              </View>
            </View>
          )}

          {tab === 'Photos' && (
            <View>
              <Text style={styles.sectionTitle}>Gallery</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.photosScrollView}
                contentContainerStyle={styles.photosContainer}
              >
                {venue.images?.map((img, idx) => (
                  <TouchableOpacity key={idx} style={styles.photoItem}>
                    <Image
                      source={{ uri: img }}
                      style={styles.photoImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* Reserve Button */}
      <View style={styles.reserveContainer}>
        <TouchableOpacity
          style={styles.reserveButton}
          onPress={() =>
            navigation.navigate('ReservationScreen', {
              groundId: venue._id,
              fields: venue.fields || []
            })
          }
        >
          <Ionicons
            name="calendar"
            size={20}
            color="black"
            style={styles.reserveIcon}
          />
          <Text style={styles.reserveButtonText}>Make a Reservation</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  heroSection: {
    position: 'relative',
    height: 280,
    marginBottom: -30
  },
  heroImage: {
    width: '100%',
    height: '100%'
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)'
  },
  headerControls: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)'
  },
  rightControls: {
    flexDirection: 'row',
    gap: 12
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 24,
    marginTop: 0
  },
  venueInfoCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 24
  },
  venueHeader: {
    marginBottom: 16
  },
  venueMainInfo: {
    marginBottom: 16
  },
  venueName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8
  },
  venueTypeContainer: {
    marginBottom: 12
  },
  typeBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start'
  },
  typeBadgeText: {
    color: '#1976D2',
    fontSize: 12,
    fontWeight: '600'
  },
  venueMetrics: {
    gap: 8
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  metricText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500'
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5'
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    position: 'relative'
  },
  activeTabButton: {
    backgroundColor: '#FFFBD4'
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666'
  },
  activeTabText: {
    color: 'black'
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'white',
    borderRadius: 1
  },
  tabContent: {
    paddingHorizontal: 20
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16
  },
  amenitiesGrid: {
    gap: 12
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  amenityText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500'
  },
  fieldDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16
  },
  fieldDetail: {
    flex: 1,
    minWidth: '45%'
  },
  fieldDetailLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
    marginBottom: 4
  },
  fieldDetailValue: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600'
  },
  paymentMethods: {
    gap: 12
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  paymentMethodText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500'
  },
  reviewForm: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4
  },
  starRating: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 16
  },
  starIcon: {
    marginHorizontal: 2
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 16,
    backgroundColor: '#F8F9FA'
  },
  submitButton: {
    backgroundColor: '#f5e43d',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center'
  },
  submitButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '600'
  },
  reviewsList: {
    gap: 16,
    marginBottom: 20
  },
  emptyReviews: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 16
  },
  emptyReviewsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 12
  },
  emptyReviewsSubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    marginTop: 4
  },
  reviewItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  reviewerInitial: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  reviewerInfo: {
    flex: 1
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2
  },
  reviewComment: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20
  },
  photosScrollView: {
    marginTop: 16
  },
  photosContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12
  },
  photoItem: {
    marginRight: 12
  },
  photoImage: {
    width: 200,
    height: 140,
    borderRadius: 16
  },
  reserveContainer: {
    padding: 20,
    paddingBottom: 34,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5'
  },
  reserveButton: {
    backgroundColor: '#f5e43d',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#f5e43d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8
  },
  reserveIcon: {
    marginRight: 8
  },
  reserveButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '700'
  }
});
