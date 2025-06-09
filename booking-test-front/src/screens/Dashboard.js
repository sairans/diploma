import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Switch,
  Modal,
  Pressable
} from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function Dashboard() {
  const [grounds, setGrounds] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [userId, setUserId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGround, setSelectedGround] = useState(null);

  const [form, setForm] = useState({
    name: '',
    type: 'football',
    address: '',
    location: {
      type: 'Point',
      coordinates: ['71.3875', '51.0909']
    },
    availableHours: {
      start: '08:00',
      end: '22:00'
    },
    availableWeekdays: [1, 2, 3, 4, 5, 6, 7],
    pricePerHour: '',
    available: true,
    fields: [],
    contact: {
      instagram: '',
      phone: ''
    },
    info: {
      size: '',
      cover: 'grass',
      balls: 'paid'
    },
    images: []
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [creatingGround, setCreatingGround] = useState(false);
  const [loading, setLoading] = useState(true);

  const weekdayOptions = [
    { label: 'Monday', value: 1 },
    { label: 'Tuesday', value: 2 },
    { label: 'Wednesday', value: 3 },
    { label: 'Thursday', value: 4 },
    { label: 'Friday', value: 5 },
    { label: 'Saturday', value: 6 },
    { label: 'Sunday', value: 7 }
  ];

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userRes = await axios.get('http://172.20.10.5:5001/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const userId = userRes.data._id;
      setUserId(userId);

      const resGrounds = await axios.get(
        `http://172.20.10.5:5001/api/grounds/my/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      let resBookings = { data: { bookings: [] } };
      if (resGrounds.data.grounds && resGrounds.data.grounds.length > 0) {
        const groundId = resGrounds.data.grounds[0]._id;
        resBookings = await axios.get(
          `http://172.20.10.5:5001/api/bookings/ground/${groundId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }

      setGrounds(resGrounds.data.grounds || []);
      setBookings(resBookings.data.bookings || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      Alert.alert('Error', 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleImageUpload = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert(
          'Permission Denied',
          'Permission to access gallery is required!'
        );
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8
      });

      if (pickerResult.cancelled) {
        return;
      }

      setUploadingImage(true);

      // In a real app, you would upload to your server or Cloudinary here
      // For demo, we'll just use the local URI
      setForm((prevForm) => ({
        ...prevForm,
        images: [...prevForm.images, pickerResult.uri]
      }));
    } catch (error) {
      Alert.alert('Upload Error', 'Failed to upload image. Please try again.');
      console.error('Image upload error:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateGround = async () => {
    try {
      setCreatingGround(true);

      // Validate required fields
      if (!form.name || !form.address || !form.pricePerHour) {
        Alert.alert('Validation Error', 'Please fill all required fields');
        return;
      }

      // Parse coordinates to numbers
      const lat = parseFloat(form.location.coordinates[1]);
      const lng = parseFloat(form.location.coordinates[0]);
      if (isNaN(lat) || isNaN(lng)) {
        Alert.alert(
          'Invalid Coordinates',
          'Please enter valid latitude and longitude.'
        );
        return;
      }

      const newGround = {
        ...form,
        location: {
          type: 'Point',
          coordinates: [lng, lat] // Note: GeoJSON uses [longitude, latitude]
        },
        pricePerHour: parseInt(form.pricePerHour),
        fields: form.fields.map((field, index) => ({
          ...field,
          number: index + 1
        }))
      };

      const token = await AsyncStorage.getItem('token');
      const res = await axios.post(
        'http://172.20.10.5:5001/api/grounds',
        newGround,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      Alert.alert('Success', 'Ground created successfully!');
      setForm({
        name: '',
        type: 'football',
        address: '',
        location: {
          type: 'Point',
          coordinates: ['71.3875', '51.0909']
        },
        availableHours: { start: '08:00', end: '22:00' },
        availableWeekdays: [1, 2, 3, 4, 5, 6, 7],
        pricePerHour: '',
        available: true,
        fields: [],
        contact: { instagram: '', phone: '' },
        info: { size: '', cover: 'grass', balls: 'paid' },
        images: []
      });
      fetchData();
    } catch (err) {
      console.error('Error creating ground:', err);
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Failed to create ground'
      );
    } finally {
      setCreatingGround(false);
    }
  };

  const toggleWeekday = (weekday) => {
    setForm((prevForm) => {
      const newWeekdays = [...prevForm.availableWeekdays];
      const index = newWeekdays.indexOf(weekday);

      if (index === -1) {
        newWeekdays.push(weekday);
      } else {
        newWeekdays.splice(index, 1);
      }

      return {
        ...prevForm,
        availableWeekdays: newWeekdays.sort()
      };
    });
  };

  const renderGroundDetails = (ground) => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{ground.name}</Text>

            <ScrollView>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type:</Text>
                <Text style={styles.detailValue}>{ground.type}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Address:</Text>
                <Text style={styles.detailValue}>{ground.address}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Price per hour:</Text>
                <Text style={styles.detailValue}>{ground.pricePerHour} ₸</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Working hours:</Text>
                <Text style={styles.detailValue}>
                  {ground.availableHours.start} - {ground.availableHours.end}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Fields:</Text>
                <View style={styles.fieldsContainer}>
                  {ground.fields.map((field, index) => (
                    <View key={index} style={styles.fieldBadge}>
                      <Text style={styles.fieldText}>{field.name}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {ground.images && ground.images.length > 0 && (
                <ScrollView horizontal style={styles.imageScroll}>
                  {ground.images.map((img, idx) => (
                    <Image
                      key={idx}
                      source={{ uri: img }}
                      style={styles.modalImage}
                    />
                  ))}
                </ScrollView>
              )}
            </ScrollView>

            <Pressable
              style={[styles.button, styles.closeButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1d4ed8" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>My Sports Grounds</Text>

      {/* Create New Ground Form */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Create New Ground</Text>

        <TextInput
          placeholder="Ground Name*"
          style={styles.input}
          value={form.name}
          onChangeText={(text) => setForm({ ...form, name: text })}
        />

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.type}
            onValueChange={(itemValue) => setForm({ ...form, type: itemValue })}
            style={styles.picker}
          >
            <Picker.Item label="Football" value="football" />
            <Picker.Item label="Basketball" value="basketball" />
            <Picker.Item label="Tennis" value="tennis" />
            <Picker.Item label="Volleyball" value="volleyball" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        </View>

        <TextInput
          placeholder="Address*"
          style={styles.input}
          value={form.address}
          onChangeText={(text) => setForm({ ...form, address: text })}
        />

        <View style={styles.coordinatesContainer}>
          <TextInput
            placeholder="Longitude*"
            style={[styles.input, styles.coordinateInput]}
            keyboardType="numeric"
            value={form.location.coordinates[0]}
            onChangeText={(text) => {
              const coords = [...form.location.coordinates];
              coords[0] = text;
              setForm({
                ...form,
                location: { ...form.location, coordinates: coords }
              });
            }}
          />
          <TextInput
            placeholder="Latitude*"
            style={[styles.input, styles.coordinateInput]}
            keyboardType="numeric"
            value={form.location.coordinates[1]}
            onChangeText={(text) => {
              const coords = [...form.location.coordinates];
              coords[1] = text;
              setForm({
                ...form,
                location: { ...form.location, coordinates: coords }
              });
            }}
          />
        </View>

        <TextInput
          placeholder="Price Per Hour (₸)*"
          keyboardType="numeric"
          style={styles.input}
          value={form.pricePerHour}
          onChangeText={(text) => setForm({ ...form, pricePerHour: text })}
        />

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Available for booking:</Text>
          <Switch
            value={form.available}
            onValueChange={(val) => setForm({ ...form, available: val })}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={form.available ? '#1d4ed8' : '#f4f3f4'}
          />
        </View>

        <View style={styles.timeContainer}>
          <Text style={styles.timeLabel}>Opening Time:</Text>
          <TextInput
            style={[styles.input, styles.timeInput]}
            value={form.availableHours.start}
            onChangeText={(text) =>
              setForm({
                ...form,
                availableHours: { ...form.availableHours, start: text }
              })
            }
            placeholder="08:00"
          />

          <Text style={styles.timeLabel}>Closing Time:</Text>
          <TextInput
            style={[styles.input, styles.timeInput]}
            value={form.availableHours.end}
            onChangeText={(text) =>
              setForm({
                ...form,
                availableHours: { ...form.availableHours, end: text }
              })
            }
            placeholder="22:00"
          />
        </View>

        <View style={styles.weekdaysContainer}>
          <Text style={styles.sectionSubtitle}>Available Days:</Text>
          <View style={styles.weekdaysRow}>
            {weekdayOptions.map((day) => (
              <TouchableOpacity
                key={day.value}
                style={[
                  styles.weekdayButton,
                  form.availableWeekdays.includes(day.value) &&
                    styles.weekdayButtonSelected
                ]}
                onPress={() => toggleWeekday(day.value)}
              >
                <Text
                  style={[
                    styles.weekdayText,
                    form.availableWeekdays.includes(day.value) &&
                      styles.weekdayTextSelected
                  ]}
                >
                  {day.label[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.sectionSubtitle}>Field Information:</Text>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.info.cover}
              onValueChange={(itemValue) =>
                setForm({
                  ...form,
                  info: { ...form.info, cover: itemValue }
                })
              }
              style={styles.picker}
            >
              <Picker.Item label="Grass" value="grass" />
              <Picker.Item label="Artificial Grass" value="artificial" />
              <Picker.Item label="Concrete" value="concrete" />
              <Picker.Item label="Wood" value="wood" />
              <Picker.Item label="Other" value="other" />
            </Picker>
          </View>

          <TextInput
            placeholder="Field Size (e.g., 105x68)"
            style={styles.input}
            value={form.info.size}
            onChangeText={(text) =>
              setForm({
                ...form,
                info: { ...form.info, size: text }
              })
            }
          />

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.info.balls}
              onValueChange={(itemValue) =>
                setForm({
                  ...form,
                  info: { ...form.info, balls: itemValue }
                })
              }
              style={styles.picker}
            >
              <Picker.Item label="Balls: Paid" value="paid" />
              <Picker.Item label="Balls: Free" value="free" />
              <Picker.Item label="Balls: Not Provided" value="none" />
            </Picker>
          </View>
        </View>

        <View style={styles.contactContainer}>
          <Text style={styles.sectionSubtitle}>Contact Information:</Text>

          <TextInput
            placeholder="Instagram Handle"
            style={styles.input}
            value={form.contact.instagram}
            onChangeText={(text) =>
              setForm({
                ...form,
                contact: { ...form.contact, instagram: text }
              })
            }
          />

          <TextInput
            placeholder="Phone Number*"
            style={styles.input}
            value={form.contact.phone}
            onChangeText={(text) =>
              setForm({
                ...form,
                contact: { ...form.contact, phone: text }
              })
            }
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.contactContainer}>
          <Text style={styles.sectionSubtitle}>Description:</Text>
          <TextInput
            placeholder="Description of the ground"
            style={styles.input}
            value={form.description}
            onChangeText={(text) => setForm({ ...form, description: text })}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.fieldsContainer}>
          <Text style={styles.sectionSubtitle}>Fields/Courts:</Text>

          {form.fields.map((field, index) => (
            <View key={index} style={styles.fieldInputContainer}>
              <TextInput
                placeholder={`Field ${index + 1} Name`}
                style={[styles.input, styles.fieldInput]}
                value={field.name}
                onChangeText={(text) => {
                  const updated = [...form.fields];
                  updated[index].name = text;
                  setForm({ ...form, fields: updated });
                }}
              />

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  const updated = [...form.fields];
                  updated.splice(index, 1);
                  setForm({ ...form, fields: updated });
                }}
              >
                <Text style={styles.deleteButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              const updated = [...form.fields, { name: '', available: 1 }];
              setForm({ ...form, fields: updated });
            }}
          >
            <Text style={styles.addButtonText}>+ Add Field</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.imagesContainer}>
          <Text style={styles.sectionSubtitle}>Images:</Text>

          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleImageUpload}
            disabled={uploadingImage}
          >
            {uploadingImage ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Upload Image</Text>
            )}
          </TouchableOpacity>

          {form.images.length > 0 && (
            <ScrollView horizontal style={styles.imagesScroll}>
              {form.images.map((img, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri: img }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => {
                      const updated = [...form.images];
                      updated.splice(index, 1);
                      setForm({ ...form, images: updated });
                    }}
                  >
                    <Text style={styles.removeImageText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleCreateGround}
          disabled={creatingGround}
        >
          {creatingGround ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create Ground</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Existing Grounds */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>My Grounds ({grounds.length})</Text>

        {grounds.length === 0 ? (
          <Text style={styles.noDataText}>You don't have any grounds yet</Text>
        ) : (
          grounds.map((ground) => (
            <TouchableOpacity
              key={ground._id}
              style={styles.groundItem}
              onPress={() => {
                setSelectedGround(ground);
                setModalVisible(true);
              }}
            >
              {ground.images && ground.images.length > 0 && (
                <Image
                  source={{ uri: ground.images[0] }}
                  style={styles.groundImage}
                />
              )}

              <View style={styles.groundInfo}>
                <Text style={styles.groundName}>{ground.name}</Text>
                <Text style={styles.groundType}>{ground.type}</Text>
                <Text style={styles.groundPrice}>
                  {ground.pricePerHour} ₸/hour
                </Text>
              </View>

              <View
                style={[
                  styles.availabilityBadge,
                  ground.available
                    ? styles.availableBadge
                    : styles.unavailableBadge
                ]}
              >
                <Text style={styles.availabilityText}>
                  {ground.available ? 'Available' : 'Unavailable'}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Recent Bookings */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Recent Bookings</Text>

        {bookings.length === 0 ? (
          <Text style={styles.noDataText}>No bookings yet</Text>
        ) : (
          bookings.map((booking) => (
            <View key={booking._id} style={styles.bookingItem}>
              <Text style={styles.bookingText}>
                <Text style={styles.bookingLabel}>Ground:</Text>{' '}
                {booking.ground?.name || 'Unknown'}
              </Text>
              <Text style={styles.bookingText}>
                <Text style={styles.bookingLabel}>Date:</Text>{' '}
                {new Date(booking.date).toLocaleString()}
              </Text>
              <Text style={styles.bookingText}>
                <Text style={styles.bookingLabel}>Field:</Text>{' '}
                {booking.field?.name || 'Unknown'}
              </Text>
              <Text style={styles.bookingText}>
                <Text style={styles.bookingLabel}>Hours:</Text>{' '}
                {booking.hours.join(', ')}
              </Text>
            </View>
          ))
        )}
      </View>

      {selectedGround && renderGroundDetails(selectedGround)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 20,
    color: '#1d4ed8',
    textAlign: 'center'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    color: '#555'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden'
  },
  picker: {
    width: '100%',
    backgroundColor: '#fff'
  },
  coordinatesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  coordinateInput: {
    flex: 1,
    marginRight: 8
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8
  },
  switchLabel: {
    fontSize: 16,
    color: '#555'
  },
  timeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  timeLabel: {
    width: '100%',
    fontSize: 16,
    color: '#555',
    marginBottom: 8
  },
  timeInput: {
    width: '48%'
  },
  weekdaysContainer: {
    marginBottom: 16
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8
  },
  weekdayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  weekdayButtonSelected: {
    backgroundColor: '#1d4ed8',
    borderColor: '#1d4ed8'
  },
  weekdayText: {
    fontSize: 16,
    color: '#555'
  },
  weekdayTextSelected: {
    color: '#fff'
  },
  infoContainer: {
    marginBottom: 16
  },
  contactContainer: {
    marginBottom: 16
  },
  fieldsContainer: {
    marginBottom: 16
  },
  // fieldButton: {
  //   backgroundColor: '#1d4ed8',
  //   padding: 12,
  //   borderRadius: 8,
  //   alignItems: 'left',
  //   marginBottom: 8
  // },
  fieldInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  fieldInput: {
    flex: 1,
    marginRight: 8
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center'
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 20
  },
  addButton: {
    backgroundColor: '#1d4ed8',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  imagesContainer: {
    marginBottom: 16
  },
  uploadButton: {
    backgroundColor: '#1d4ed8',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12
  },
  imagesScroll: {
    flexDirection: 'row'
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center'
  },
  removeImageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 16
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  submitButton: {
    backgroundColor: '#1d4ed8',
    marginTop: 8
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  groundItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8
  },
  groundImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12
  },
  groundInfo: {
    flex: 1
  },
  groundName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333'
  },
  groundType: {
    fontSize: 14,
    color: '#666',
    marginTop: 2
  },
  groundPrice: {
    fontSize: 14,
    color: '#1d4ed8',
    marginTop: 2,
    fontWeight: '500'
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start'
  },
  availableBadge: {
    backgroundColor: '#d1fae5'
  },
  unavailableBadge: {
    backgroundColor: '#fee2e2'
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '500'
  },
  bookingItem: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8
  },
  bookingText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#555'
  },
  bookingLabel: {
    fontWeight: '500',
    color: '#333'
  },
  noDataText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 16
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#1d4ed8'
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 10
  },
  detailLabel: {
    fontWeight: 'bold',
    width: 120,
    color: '#555'
  },
  detailValue: {
    flex: 1,
    color: '#333'
  },
  fieldsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5
  },
  fieldBadge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8
  },
  fieldText: {
    color: '#1d4ed8',
    fontSize: 14
  },
  imageScroll: {
    marginVertical: 10
  },
  modalImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginRight: 10
  },
  closeButton: {
    backgroundColor: '#1d4ed8',
    marginTop: 15,
    padding: 10,
    borderRadius: 8
  }
});
