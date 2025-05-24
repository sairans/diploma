import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';


export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      {/* Логотип */}
      <Image source={require('../../assets/images/logo.png')} style={styles.logo} />

      <Text style={styles.title}>SIGN IN</Text>
      <Text style={styles.subtitle}>Enter your phone number and password</Text>

      {/* Поле ввода телефона */}
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

      {/* Поле ввода пароля */}
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
          <Text style={styles.togglePassword}>{showPassword ? '🙈' : '👁'}</Text>
        </TouchableOpacity>
      </View>

      {/* Ссылка "Забыли пароль?" */}
      <TouchableOpacity>
        <Text style={styles.forgotPassword}>Forgot password?</Text>
      </TouchableOpacity>

      <Text style={styles.terms}>
        By clicking "Sign in", you accept the terms of the{' '}
        <Text style={styles.link}>Privacy Policy</Text> and{' '}
        <Text style={styles.link}>User Agreement</Text>.
      </Text>

      {/* Кнопка входа */}
      <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Main')}>
        <Text style={styles.loginText}>Sign in</Text>
      </TouchableOpacity>

      {/* Регистрация */}
      <Text style={styles.registerText}>
        No account yet?{' '}
        <Text style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
          Register
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
    paddingTop: 80,
  },
  logo: {
    width: 233,
    height: 216,
    marginTop: 50,
    marginBottom: 20,
  },
  title: {
    fontWeight: 400,
    fontSize: 48,
    color: '#FFFBD4',
    marginBottom: 10,
    fontFamily: 'CinzelDecorative-Regular',
  },
  subtitle: {
    color: '#FFFBD4',
    fontSize: 14,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '85%',
    backgroundColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  flag: {
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#FFFBD4',
  },
  togglePassword: {
    fontSize: 16,
    color: '#FFFBD4',
    marginLeft: 10,
  },
  forgotPassword: {
    color: '#FFFBD4',
    marginBottom: 15,
  },
  loginButton: {
    backgroundColor: '#FFFBD4',
    padding: 15,
    borderRadius: 12,
    width: '85%',
    alignItems: 'center',
    marginVertical: 10,
  },
  loginText: {
    color: '#1d1f1e',
    fontWeight: 'bold',
    fontSize: 16,
  },
  terms: {
    color: '#FFFBD4',
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  link: {
    color: '#FF0000',
  },
  registerText: {
    color: '#FFFBD4',
    fontSize: 12,
    marginTop: 10,
  },
  registerLink: {
    color: '#FF0000',
    fontWeight: 'bold',
  },
});
