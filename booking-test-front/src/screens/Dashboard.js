import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
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

export default function Dashboard() {
  const [grounds, setGrounds] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [userId, setUserId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGround, setSelectedGround] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    if (editMode && selectedGround) {
      setForm(selectedGround);
      setOriginalData(selectedGround);
    }
  }, [selectedGround, editMode]);

  function getChangedFields(original, updated) {
    const changed = {};

    for (const key in updated) {
      if (
        typeof updated[key] === 'object' &&
        updated[key] !== null &&
        !Array.isArray(updated[key])
      ) {
        const deep = getChangedFields(original[key] || {}, updated[key]);
        if (Object.keys(deep).length > 0) changed[key] = deep;
      } else if (Array.isArray(updated[key])) {
        if (JSON.stringify(original[key]) !== JSON.stringify(updated[key])) {
          changed[key] = updated[key];
        }
      } else {
        if (updated[key] !== original[key]) {
          changed[key] = updated[key];
        }
      }
    }

    return changed;
  }

  const [form, setForm] = useState({
    name: '',
    description: 'sport ground',
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
    availableWeekdays: [0, 1, 2, 3, 4, 5, 6], // Sunday=0 to Saturday=6
    pricePerHour: '',
    available: true,
    fields: [],
    contacts: {
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
  const [processing, setProcessing] = useState(false);

  const weekdayOptions = [
    { label: 'Sunday', value: 0 },
    { label: 'Monday', value: 1 },
    { label: 'Tuesday', value: 2 },
    { label: 'Wednesday', value: 3 },
    { label: 'Thursday', value: 4 },
    { label: 'Friday', value: 5 },
    { label: 'Saturday', value: 6 }
  ];

  // Cloudinary configuration
  const CLOUD_NAME = 'dnpym2yjn';
  const UPLOAD_PRESET = 'mobile_upload';

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

  const uploadToCloudinary = async (imageUri) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'photo.jpg'
      });
      formData.append('upload_preset', UPLOAD_PRESET);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  };

  const handleImageUpload = async () => {
    try {
      const { granted } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission Denied', 'Need access to camera roll');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        aspect: [4, 3]
      });

      if (result.canceled || !result.assets || !result.assets[0]) return;

      const imageUri = result.assets[0].uri;

      setUploadingImage(true);
      const imageUrl = await uploadToCloudinary(imageUri);

      setForm((prev) => ({
        ...prev,
        images: [...(prev.images || []), imageUrl]
      }));
    } catch (error) {
      console.error('Image upload failed:', error);
      Alert.alert('Upload Failed', 'Please try again');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setProcessing(true);

      // Validate required fields
      if (
        !form.name ||
        !form.address ||
        !form.pricePerHour ||
        !form.info?.size ||
        !form.info?.cover
      ) {
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

      const groundData = {
        ...form,
        location: {
          type: 'Point',
          coordinates: [lng, lat] // GeoJSON uses [longitude, latitude]
        },
        pricePerHour: parseInt(form.pricePerHour),
        fields: form.fields.map((field, index) => ({
          ...field,
          number: index + 1,
          available: field.available !== false // Ensure boolean
        })),
        availableWeekdays: form.availableWeekdays.sort((a, b) => a - b)
      };

      const token = await AsyncStorage.getItem('token');

      if (editMode && selectedGround) {
        // Update existing ground
        console.log('SUBMITTING GROUND DATA:', groundData);
        const { _id, __v, createdAt, updatedAt, ...cleanData } = groundData;
        const changedFields = getChangedFields(originalData, groundData);
        await axios.put(
          `http://172.20.10.5:5001/api/grounds/${selectedGround._id}`,
          changedFields,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        Alert.alert('Success', 'Ground updated successfully!');
      } else {
        // Create new ground
        await axios.post('http://172.20.10.5:5001/api/grounds', groundData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        Alert.alert('Success', 'Ground created successfully!');
      }

      resetForm();
      fetchData();
    } catch (err) {
      console.error('Error submitting ground:', err);
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Failed to submit ground'
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (groundId) => {
    try {
      Alert.alert(
        'Confirm Delete',
        'Are you sure you want to delete this ground?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Delete',
            onPress: async () => {
              setProcessing(true);
              const token = await AsyncStorage.getItem('token');
              await axios.delete(
                `http://172.20.10.5:5001/api/grounds/${groundId}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                }
              );
              Alert.alert('Success', 'Ground deleted successfully!');
              fetchData();
            },
            style: 'destructive'
          }
        ]
      );
    } catch (err) {
      console.error('Error deleting ground:', err);
      Alert.alert('Error', 'Failed to delete ground');
    } finally {
      setProcessing(false);
    }
  };

  const handleEdit = (ground) => {
    setSelectedGround(ground);
    setEditMode(true);
    setForm({
      ...ground,
      location: {
        ...ground.location,
        coordinates: ground.location.coordinates.map(String)
      },
      pricePerHour: String(ground.pricePerHour),
      fields: ground.fields || [],
      contacts: ground.contacts || { instagram: '', phone: '' },
      info: ground.info || { size: '', cover: 'grass', balls: 'paid' }
    });
  };

  const resetForm = () => {
    setForm({
      name: '',
      description: 'sport ground',
      type: 'football',
      address: '',
      location: {
        type: 'Point',
        coordinates: ['71.3875', '51.0909']
      },
      availableHours: { start: '08:00', end: '22:00' },
      availableWeekdays: [0, 1, 2, 3, 4, 5, 6],
      pricePerHour: '',
      available: true,
      fields: [],
      contacts: { instagram: '', phone: '' },
      info: { size: '', cover: 'grass', balls: 'paid' },
      images: ['https://example.com/placeholder-image.jpg']
    });
    setEditMode(false);
    setSelectedGround(null);
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
        availableWeekdays: newWeekdays.sort((a, b) => a - b)
      };
    });
  };

  const toggleFieldAvailability = (index) => {
    setForm((prevForm) => {
      const updatedFields = [...prevForm.fields];
      updatedFields[index] = {
        ...updatedFields[index],
        available: !updatedFields[index].available
      };
      return {
        ...prevForm,
        fields: updatedFields
      };
    });
  };

  const renderGroundDetails = () => {
    if (!selectedGround) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{selectedGround.name}</Text>

            <ScrollView>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Description:</Text>
                <Text style={styles.detailValue}>
                  {selectedGround.description}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type:</Text>
                <Text style={styles.detailValue}>{selectedGround.type}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Address:</Text>
                <Text style={styles.detailValue}>{selectedGround.address}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Coordinates:</Text>
                <Text style={styles.detailValue}>
                  {selectedGround.location.coordinates[1]},{' '}
                  {selectedGround.location.coordinates[0]}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Price per hour:</Text>
                <Text style={styles.detailValue}>
                  {selectedGround.pricePerHour} ₸
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Working hours:</Text>
                <Text style={styles.detailValue}>
                  {selectedGround.availableHours.start} -{' '}
                  {selectedGround.availableHours.end}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Available days:</Text>
                <Text style={styles.detailValue}>
                  {selectedGround.availableWeekdays
                    .sort((a, b) => a - b)
                    .map(
                      (day) =>
                        weekdayOptions.find((d) => d.value === day)?.label
                    )
                    .join(', ')}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Field Info:</Text>
                <View>
                  <Text>Size: {selectedGround.info.size}</Text>
                  <Text>Cover: {selectedGround.info.cover}</Text>
                  <Text>Balls: {selectedGround.info.balls}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Fields:</Text>
                <View style={styles.fieldsContainer}>
                  {selectedGround.fields.map((field, index) => (
                    <View
                      key={index}
                      style={[
                        styles.fieldBadge,
                        !field.available && styles.unavailableField
                      ]}
                    >
                      <Text style={styles.fieldText}>
                        {field.number}. {field.name || 'Field'} -{' '}
                        {field.available ? 'Available' : 'Unavailable'}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Contacts:</Text>
                <View>
                  {selectedGround.contacts.phone && (
                    <Text>Phone: {selectedGround.contacts.phone}</Text>
                  )}
                  {selectedGround.contacts.instagram && (
                    <Text>Instagram: {selectedGround.contacts.instagram}</Text>
                  )}
                </View>
              </View>

              {selectedGround.images && selectedGround.images.length > 0 && (
                <ScrollView horizontal style={styles.imageScroll}>
                  {selectedGround.images.map((img, idx) => (
                    <Image
                      key={idx}
                      source={{ uri: img }}
                      style={styles.modalImage}
                    />
                  ))}
                </ScrollView>
              )}
            </ScrollView>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.closeButton]}
                onPress={() => {
                  setModalVisible(false);
                  handleEdit(selectedGround);
                }}
              >
                <Text style={styles.buttonText}>Edit</Text>
              </Pressable>

              <Pressable
                style={[styles.modalButton, styles.deleteButton]}
                onPress={() => {
                  setModalVisible(false);
                  handleDelete(selectedGround._id);
                }}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </Pressable>

              <Pressable
                style={[styles.modalButton, styles.closeButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffeb24" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>My Sports Grounds</Text>

      {/* Ground Form */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {editMode ? `Edit ${form.name}` : 'Create New Ground'}
          {editMode && (
            <TouchableOpacity
              style={styles.cancelEditButton}
              onPress={resetForm}
            >
              <Text style={styles.cancelEditText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </Text>

        <TextInput
          placeholder="Ground Name*"
          style={styles.input}
          value={form.name}
          onChangeText={(text) => setForm({ ...form, name: text })}
        />

        <TextInput
          placeholder="Description"
          style={styles.input}
          value={form.description}
          onChangeText={(text) => setForm({ ...form, description: text })}
          multiline
        />

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.type}
            onValueChange={(itemValue) => setForm({ ...form, type: itemValue })}
            style={styles.picker}
          >
            <Picker.Item label="Football" value="football" />
            <Picker.Item label="Basketball" value="basketball" />
            <Picker.Item label="Volleyball" value="volleyball" />
            <Picker.Item label="Tennis" value="tennis" />
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
            trackColor={{ false: '#767577', true: '#FFFBD4' }}
            thumbColor={form.available ? '#FFFBD4' : '#FFFBD4'}
          />
        </View>

        <View style={styles.timeContainer}>
          <Text style={styles.timeLabel}>Opening Time* (HH:mm):</Text>
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

          <Text style={styles.timeLabel}>Closing Time* (HH:mm):</Text>
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
            placeholder="Field Size* (e.g., 105x68)"
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
            value={form.contacts.instagram}
            onChangeText={(text) =>
              setForm({
                ...form,
                contacts: { ...form.contacts, instagram: text }
              })
            }
          />

          <TextInput
            placeholder="Phone Number"
            style={styles.input}
            value={form.contacts.phone}
            onChangeText={(text) =>
              setForm({
                ...form,
                contacts: { ...form.contacts, phone: text }
              })
            }
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.fieldsContainer}>
          <Text style={styles.sectionSubtitle}>Fields/Courts:</Text>

          {form.fields.map((field, index) => (
            <View key={index} style={styles.fieldInputContainer}>
              <Text style={styles.label}>Field/Court Name:</Text>

              <TextInput
                placeholder={`Field ${index + 1}`}
                style={[styles.input, styles.fieldInput]}
                value={field.name}
                onChangeText={(text) => {
                  const updated = [...form.fields];
                  updated[index].name = text;
                  setForm({ ...form, fields: updated });
                }}
              />

              <View style={styles.fieldBottomRow}>
                <View style={styles.fieldAvailabilityContainer}>
                  <Text>Available:</Text>
                  <Switch
                    value={field.available !== false}
                    onValueChange={() => toggleFieldAvailability(index)}
                  />
                </View>

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
            </View>
          ))}

          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => {
              const updated = [...form.fields, { name: '', available: true }];
              setForm({ ...form, fields: updated });
            }}
          >
            <Text style={styles.buttonText}>+ Add Field</Text>
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
                      setForm({
                        ...form,
                        images: updated
                      });
                    }}
                  >
                    <Text style={styles.removeImageText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.formButtons}>
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {editMode ? 'Update Ground' : 'Create Ground'}
              </Text>
            )}
          </TouchableOpacity>

          {editMode && (
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={() => handleDelete(selectedGround._id)}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Delete Ground</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
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
                <Text style={styles.groundDescription} numberOfLines={2}>
                  {ground.description}
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
                {(booking.timeSlot || []).join(', ')}
              </Text>
            </View>
          ))
        )}
      </View>

      {renderGroundDetails()}
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
    marginBottom: 20,
    marginTop: 40,
    color: '#000000',
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
    marginBottom: 12
  },
  timeLabel: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8
  },
  timeInput: {
    marginBottom: 12
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
    backgroundColor: '#FFFBD4',
    borderColor: '#FFFBD4'
  },
  weekdayText: {
    fontSize: 16,
    color: '#555'
  },
  weekdayTextSelected: {
    color: '#000000'
  },
  infoContainer: {
    marginBottom: 16
  },
  contactContainer: {
    marginBottom: 16
  },
  fieldInputContainer: {
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4
  },

  label: {
    marginBottom: 6,
    fontWeight: '600'
  },

  fieldBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10
  },

  fieldAvailabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    gap: 10
  },

  deleteButton: {
    backgroundColor: '#ef4444',
    marginTop: 15,
    padding: 10,
    borderRadius: 8
  },

  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  addButton: {
    backgroundColor: '#FFFBD4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8
  },
  addButtonText: {
    color: '#00000',
    fontWeight: 'bold',
    fontSize: 16
  },
  imagesContainer: {
    marginBottom: 16
  },
  uploadButton: {
    backgroundColor: '#FFFBD4',
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
    marginTop: 8,
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
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  submitButton: {
    backgroundColor: '#FFFBD4',
    flex: 1,
    marginRight: 8
  },
  buttonText: {
    color: '#00000',
    fontWeight: 'bold',
    fontSize: 16
  },
  cancelEditButton: {
    position: 'absolute',
    right: 0,
    padding: 8
  },
  cancelEditText: {
    color: '#1d4ed8',
    fontWeight: '500'
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
    width: 80,
    height: 80,
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
    color: '#ffeb24',
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
    width: '100%', // Make container take full width
    marginTop: 8
  },
  fieldInputContainer: {
    width: '100%', // Make each field container full width
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef'
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#495057'
  },
  input: {
    width: '100%', // Make input full width
    padding: 10,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 4,
    marginBottom: 12,
    backgroundColor: '#fff'
  },
  fieldInput: {
    fontSize: 16
  },
  fieldBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%'
  },
  fieldAvailabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  deleteButton: {
    padding: 8
  },
  deleteButtonText: {
    fontSize: 20,
    color: '#dc3545'
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
    backgroundColor: '#FFFBD4',
    marginTop: 15,
    padding: 10,
    borderRadius: 8
  }
});
