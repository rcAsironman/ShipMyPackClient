import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTab';
import MapScreen from '../screens/MapScreen'; // adjust path if needed
import OrderDetailsScreen from '../components/OrderDetailsScreen';
import NotificationScreen from '../screens/NotificationsScreen';
import NotificationDetailScreen from '../screens/NotificationDetailScreen';
import SupportScreen from '../screens/SupportScreen';
import TransporterOngoing from '../screens/TransporterOngoing';
import TransporterCompleted from '../screens/TransporterCompleted';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="MapScreen" component={MapScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
      <Stack.Screen name="NotificationDetail" component={NotificationDetailScreen} />
      <Stack.Screen name="SupportScreen" component={SupportScreen} />
      <Stack.Screen name="TransporterOngoing" component={TransporterOngoing}/>
      <Stack.Screen name="TransporterCompleted" component={TransporterCompleted}/>
      {/* Add more non-tab screens here */}
    </Stack.Navigator>
  );
}
