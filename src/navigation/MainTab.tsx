import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Platform, Dimensions } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import AddTripScreen from '../screens/AddTripScreen';
import EarningsScreen from '../screens/EarningsScreen';
import ProfileScreen from '../screens/ProfileScreen';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faHome,
  faHistory,
  faCirclePlus,
  faWallet,
  faUser,
} from '@fortawesome/free-solid-svg-icons';

const { width: screenWidth } = Dimensions.get('window');
const tabBarWidth = screenWidth * 0.9;
const tabBarLeft = (screenWidth - tabBarWidth) / 2;

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarIcon: ({ focused, color, size }) => {
          let icon;

          switch (route.name) {
            case 'Home':
              icon = faHome;
              break;
            case 'History':
              icon = faHistory;
              break;
            case 'AddTrip':
              icon = faCirclePlus;
              break;
            case 'Earnings':
              icon = faWallet;
              break;
            case 'Profile':
              icon = faUser;
              break;
          }

          return (
            <FontAwesomeIcon
              icon={icon}
              size={20}
              color={color}
            />
          );
        },
        tabBarLabel: route.name,
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'gray',
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
