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
import AddTripSuccessScree from '../screens/successScreens.tsx/AddTripSuccessScree';

const { width: screenWidth } = Dimensions.get('window');
// const tabBarWidth = screenWidth * 0.9; // You can still use this if you want a specific width percentage
// const tabBarLeft = (screenWidth - tabBarWidth) / 2; // And this for calculated left offset

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
     
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          paddingTop: 10,
          // The height of the tab bar including the extra space at the bottom
          height: Platform.OS === 'ios' ? 80 : 70, 
        },
        tabBarIcon: ({ focused, color, size }) => {
          let icon = faHome; // Default icon

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
            default:
              icon = faHome; // Fallback icon
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
       
      })}
      safeAreaInsets={{
        bottom: 0,
        left: 0,
        right: 0,
        top: 0
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="AddTrip" component={AddTripScreen} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}