import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MainScreen from '../screens/MainScreen';
import ArenaDetailsScreen from '../screens/ArenaScreen';
import ReservationScreen from '../screens/ReservationScreen';
import ActiveReservationScreen from '../screens/ActiveReservationScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Main" component={MainScreen} />
      <Stack.Screen name="ArenaDetails" component={ArenaDetailsScreen} />
      <Stack.Screen name="ReservationScreen" component={ReservationScreen} />
      <Stack.Screen name="ActiveReservationScreen" component={ActiveReservationScreen} />
    </Stack.Navigator>
  );
}
