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
  Image
} from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';

export default function Dashboard() {
  const [grounds, setGrounds] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({
    name: '',
    type: '',
    address: '',
    location: { coordinates: [0, 0] },
    availableHours: { start: '08:00', end: '23:00' },
    availableWeekdays: [1, 2, 3, 4, 5],
    images: []
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [creatingGround, setCreatingGround] = useState(false);

  const fetchData = async () => {
    try {
      const resGrounds = await axios.get(
        'http://192.168.59.11:5001/api/grounds'
      );
      const resBookings = await axios.get(
        'http://192.168.59.11:5001/api/bookings'
      );
      setGrounds(resGrounds.data.grounds || []);
      setBookings(resBookings.data.bookings || []);
    } catch (err) {
      console.error('Error fetching data:', err);
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
        quality: 1
      });

      if (pickerResult.cancelled) {
        return;
      }

      setUploadingImage(true);

      const localUri = pickerResult.uri;
      const filename = localUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      const formData = new FormData();
      formData.append('file', {
        uri: localUri,
        name: filename,
        type
      });
      formData.append('upload_preset', 'your_unsigned_upload_preset'); // Replace with your Cloudinary upload preset

      const cloudinaryUrl =
        'https://api.cloudinary.com/v1_1/your_cloud_name/image/upload'; // Replace with your Cloudinary cloud name URL

      const uploadRes = await axios.post(cloudinaryUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setForm((prevForm) => ({
        ...prevForm,
        images: [...prevForm.images, uploadRes.data.secure_url]
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
      // Parse coordinates to numbers
      const lat = parseFloat(form.location.coordinates[0]);
      const lng = parseFloat(form.location.coordinates[1]);
      if (isNaN(lat) || isNaN(lng)) {
        Alert.alert(
          'Invalid Coordinates',
          'Please enter valid latitude and longitude.'
        );
        setCreatingGround(false);
        return;
      }

      const newGround = {
        name: form.name,
        type: form.type,
        address: form.address,
        location: { coordinates: [lat, lng] },
        availableHours: form.availableHours,
        availableWeekdays: form.availableWeekdays,
        images: form.images
      };

      const res = await axios.post(
        'http://192.168.59.11:5001/api/grounds',
        newGround
      );
      Alert.alert('Success', 'Ground created');
      setForm({
        name: '',
        type: '',
        address: '',
        location: { coordinates: [0, 0] },
        availableHours: { start: '08:00', end: '23:00' },
        availableWeekdays: [1, 2, 3, 4, 5],
        images: []
      });
      fetchData();
    } catch (err) {
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Failed to create ground'
      );
    } finally {
      setCreatingGround(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Dashboard</Text>

      <Text style={styles.subHeader}>Create New Ground</Text>
      <TextInput
        placeholder="Name"
        style={styles.input}
        value={form.name}
        onChangeText={(text) => setForm({ ...form, name: text })}
      />
      <TextInput
        placeholder="Type"
        style={styles.input}
        value={form.type}
        onChangeText={(text) => setForm({ ...form, type: text })}
      />
      <TextInput
        placeholder="Address"
        style={styles.input}
        value={form.address}
        onChangeText={(text) => setForm({ ...form, address: text })}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TextInput
          placeholder="Latitude"
          style={[styles.input, { flex: 1, marginRight: 5 }]}
          keyboardType="numeric"
          value={form.location.coordinates[0].toString()}
          onChangeText={(text) => {
            const coords = [...form.location.coordinates];
            coords[0] = text;
            setForm({ ...form, location: { coordinates: coords } });
          }}
        />
        <TextInput
          placeholder="Longitude"
          style={[styles.input, { flex: 1, marginLeft: 5 }]}
          keyboardType="numeric"
          value={form.location.coordinates[1].toString()}
          onChangeText={(text) => {
            const coords = [...form.location.coordinates];
            coords[1] = text;
            setForm({ ...form, location: { coordinates: coords } });
          }}
        />
      </View>

      <TouchableOpacity
        style={styles.button}
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
        <ScrollView horizontal style={{ marginVertical: 10 }}>
          {form.images.map((imgUrl, index) => (
            <Image
              key={index.toString()}
              source={{ uri: imgUrl }}
              style={{
                width: 100,
                height: 100,
                marginRight: 10,
                borderRadius: 6
              }}
            />
          ))}
        </ScrollView>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={handleCreateGround}
        disabled={creatingGround}
      >
        {creatingGround ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create Ground</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.subHeader}>Existing Grounds</Text>
      <FlatList
        data={grounds}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            {item.images && item.images.length > 0 && (
              <Image
                source={{ uri: item.images[0] }}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 6,
                  marginBottom: 6
                }}
              />
            )}
            <Text style={styles.itemText}>
              {item.name} - {item.type}
            </Text>
          </View>
        )}
      />

      <Text style={styles.subHeader}>Recent Bookings</Text>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>
              Ground: {item.ground.name || item.ground}, Date: {item.date}
            </Text>
          </View>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, marginTop: 40 },
  subHeader: { fontSize: 18, fontWeight: '600', marginTop: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginVertical: 8,
    borderRadius: 6
  },
  button: {
    backgroundColor: '#1d4ed8',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 10
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  item: {
    padding: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    marginVertical: 4,
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  itemText: { color: '#111827' }
});
