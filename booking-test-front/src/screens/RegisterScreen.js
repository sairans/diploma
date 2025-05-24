import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [name, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!name || !phone || !password || !confirmPassword) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Ошибка', 'Пароли не совпадают');
      return;
    }

    try {
      await axios.post('http://172.20.10.5:5001/api/users/register', {
        name,
        phone,
        email,
        password,
        isAdmin: false,
        avatar: ''
      });

      Alert.alert('Успешно', 'Регистрация завершена');
      navigation.navigate('Login');
    } catch (err) {
      Alert.alert(
        'Ошибка',
        err.response?.data?.message || 'Ошибка при регистрации'
      );
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/logo.png')}
        style={styles.logo}
      />

      <Text style={styles.title}>REGISTER</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#777"
          value={name}
          onChangeText={setFullName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.flag}>🇰🇿</Text>
        <TextInput
          style={styles.input}
          placeholder="+7 (...) ..."
          placeholderTextColor="#777"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.flag}>✉️</Text>
        <TextInput
          style={styles.input}
          placeholder="email"
          placeholderTextColor="#777"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#777"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.togglePassword}>
            {showPassword ? '🙈' : '👁'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#777"
          secureTextEntry={!showPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.togglePassword}>
            {showPassword ? '🙈' : '👁'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.terms}>
        By clicking "Register", you accept the terms of the{' '}
        <Text style={styles.link}>Privacy Policy</Text> and{' '}
        <Text style={styles.link}>User Agreement</Text>.
      </Text>

      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.registerText}>Register</Text>
      </TouchableOpacity>

      <Text style={styles.loginText}>
        Already have an account?{' '}
        <Text
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        >
          Sign In
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1d1f1e',
    alignItems: 'center',
    paddingTop: 60
  },
  logo: {
    width: 233,
    height: 216,
    marginTop: 50,
    marginBottom: 20
  },
  title: {
    fontSize: 32,
    color: '#FFFBD4',
    marginBottom: 10,
    fontFamily: 'CinzelDecorative-Regular'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '85%',
    backgroundColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 15
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#FFFBD4'
  },
  terms: {
    color: '#FFFBD4',
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 10,
    paddingHorizontal: 20
  },
  link: {
    color: '#FF0000'
  },
  registerButton: {
    backgroundColor: '#FFFBD4',
    padding: 15,
    borderRadius: 12,
    width: '85%',
    alignItems: 'center',
    marginTop: 10
  },
  registerText: {
    color: '#1d1f1e',
    fontWeight: 'bold',
    fontSize: 16
  },
  loginText: {
    color: '#FFFBD4',
    marginTop: 15
  },
  loginLink: {
    color: '#FF0000',
    fontWeight: 'bold'
  },
  togglePassword: {
    fontSize: 18,
    marginLeft: 8,
    color: '#FFFBD4'
  },
  flag: {
    fontSize: 18,
    marginRight: 8
  }
});
