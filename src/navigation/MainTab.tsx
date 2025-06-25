import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { View, Platform } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import AddTripScreen from '../screens/AddTripScreen';
import EarningsScreen from '../screens/EarningsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const tabBarWidth = screenWidth * 0.9; // 90% width
const tabBarLeft = (screenWidth - tabBarWidth) / 2; // Centered offset

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
  screenOptions={({ route }) => ({
    headerShown: false,
    tabBarShowLabel: true,
    tabBarIcon: ({ focused, color, size }) => {
      let iconName: string = '';
      if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
      else if (route.name === 'History') iconName = focused ? 'time' : 'time-outline';
      else if (route.name === 'AddTrip') iconName = focused ? 'add-circle' : 'add-circle-outline';
      else if (route.name === 'Earnings') iconName = focused ? 'wallet' : 'wallet-outline';
      else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

      return <Ionicons name={iconName} size={24} color={color} />;
    },
    tabBarLabel: route.name, // ✅ sets label to the screen name (you can customize)
    tabBarActiveTintColor: 'black',  // ✅ active label & icon color
    tabBarInactiveTintColor: 'gray', // ✅ inactive label & icon color
    tabBarStyle: {
      position: 'absolute',
      bottom: 50,
      left: tabBarLeft,
      width: tabBarWidth,
      height: 70,
      backgroundColor: 'white',
      borderRadius: 30,
      borderWidth: 2,
      marginInline: '4.5%',
      paddingBottom: Platform.OS === 'ios' ? 20 : 10,
      paddingTop: 10,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
    },
  })}
>
  <Tab.Screen name="Home" component={HomeScreen} />
  <Tab.Screen name="History" component={HistoryScreen} />
  <Tab.Screen name="AddTrip" component={AddTripScreen} />
  <Tab.Screen name="Earnings" component={EarningsScreen} />
  <Tab.Screen name="Profile" component={ProfileScreen} />
</Tab.Navigator>

    
  );
}
