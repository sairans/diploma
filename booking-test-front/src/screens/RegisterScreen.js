import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+7');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleRegister = async () => {
    if (!name || !phone || !email || !password || !confirmPassword) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Ошибка', 'Некорректный email');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Ошибка', 'Пароль должен быть не менее 6 символов');
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.flag}>🇰🇿</Text>
            <TextInput
              style={styles.input}
              placeholder="Номер телефона"
              placeholderTextColor="#777"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(text) => {
                const digitsOnly = text.replace(/\D/g, '');
                const formatted = digitsOnly.startsWith('7')
                  ? '+7' + digitsOnly.slice(1)
                  : '+7' + digitsOnly;
                setPhone(formatted);
              }}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.flag}>✉️</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#777"
              keyboardType="email-address"
              autoCapitalize="none"
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

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
          >
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#1d1f1e',
    justifyContent: 'center'
  },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center'
  },
  logo: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
    marginBottom: 20,
    marginTop: 40
  },
  title: {
    fontSize: 32,
    color: '#FFFBD4',
    marginBottom: 24,
    fontFamily: 'CinzelDecorative-Regular',
    textAlign: 'center'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 16
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFBD4',
    paddingVertical: 10
  },
  flag: {
    fontSize: 18,
    marginRight: 8,
    color: '#FFFBD4'
  },
  togglePassword: {
    fontSize: 18,
    marginLeft: 8,
    color: '#FFFBD4'
  },
  terms: {
    color: '#FFFBD4',
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 16,
    paddingHorizontal: 12
  },
  link: {
    color: '#FF0000',
    textDecorationLine: 'underline'
  },
  registerButton: {
    backgroundColor: '#FFFBD4',
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 12
  },
  registerText: {
    color: '#1d1f1e',
    fontWeight: 'bold',
    fontSize: 16
  },
  loginText: {
    color: '#FFFBD4',
    marginTop: 20,
    fontSize: 14
  },
  loginLink: {
    color: '#FF0000',
    fontWeight: 'bold',
    marginTop: 6,
    fontSize: 14
  }
});
