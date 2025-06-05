import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MainScreen from '../screens/MainScreen';
import ArenaDetailsScreen from '../screens/ArenaScreen';
import ReservationScreen from '../screens/ReservationScreen';
import ActiveReservationScreen from '../screens/ActiveReservationScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditReservationPage from '../screens/EditReservationPage';
import Payments from '../screens/ProfilePage/Payments';
import AboutApp from '../screens/ProfilePage/AboutApp';
import SupportChat from '../screens/ProfilePage/SupportChat';
import BecomePartner from '../screens/ProfilePage/BecomePartner';
import ChangePassword from '../screens/ProfilePage/ChangePassword';
import PushNotifications from '../screens/ProfilePage/PushNotifications';
import ForgotPassword from '../screens/ForgotPassword';
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Main') iconName = 'home';
          else if (route.name === 'Reservations') iconName = 'calendar';
          else if (route.name === 'Profile') iconName = 'person';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1d1f1e',
        tabBarInactiveTintColor: '#888'
      })}
    >
      <Tab.Screen name="Main" component={MainScreen} />
      <Tab.Screen name="Reservations" component={ActiveReservationScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="Payments" component={Payments} />
      <Stack.Screen name="ArenaDetails" component={ArenaDetailsScreen} />
      <Stack.Screen name="ReservationScreen" component={ReservationScreen} />
      <Stack.Screen name="AboutApp" component={AboutApp} />
      <Stack.Screen name="SupportChat" component={SupportChat} />
      <Stack.Screen name="BecomePartner" component={BecomePartner} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} />
      <Stack.Screen name="PushNotifications" component={PushNotifications} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen
        name="ActiveReservationScreen"
        component={ActiveReservationScreen}
      />
      <Stack.Screen
        name="EditReservationPage"
        component={EditReservationPage}
      />
    </Stack.Navigator>
  );
}
