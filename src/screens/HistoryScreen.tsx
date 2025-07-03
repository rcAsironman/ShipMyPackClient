// HistoryScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Switch,
  FlatList,
  Animated,
  Easing,
  Pressable,
  Platform,
  TouchableOpacity,
  Image, // Added Image import as mock data now includes initialImages
} from 'react-native';
import { useNavigation, StackActions } from '@react-navigation/native'; // Added StackActions import
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faComments,
  faPhone,
  faMapMarkerAlt,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import Svg, { Path, Circle } from 'react-native-svg';

// --- Type Definitions ---
// For a larger project, consider moving these to a separate file like `src/types.ts`
// and importing them: `import { ShipmentOrder, ShipmentTab } from '../types';`
interface ShipmentOrder {
  id: string;
  date: string;
  time: string;
  amount: number;
  status: 'ongoing' | 'completed';
  initialImages?: string[]; // Added for transporter's image display in details
}

type ShipmentTab = 'ongoing' | 'completed';
// --- End Type Definitions ---

// Import the TransporterOrderDetailsScreen
// IMPORTANT: Adjust this path based on where TransporterOrderDetailsScreen.tsx is located
// If it's in the same folder as HistoryScreen.tsx, './TransporterOrderDetailsScreen' is correct.
import TransporterOrderDetailsScreen from './TransporterOrderDetailsScreen';

// Mock data for demonstration - UPDATED to include multiple images
const mockOrders: ShipmentOrder[] = Array.from({ length: 12 }, (_, i) => ({
  id: `ORD${10000 + i}`,
  date: '2025-06-18',
  time: '10:30 AM',
  amount: Math.floor(Math.random() * 500 + 100),
  status: i % 2 === 0 ? 'ongoing' : 'completed',
  // Provide an array of images for some orders
  initialImages: i % 3 === 0
    ? [
        `https://picsum.photos/id/${100 + i}/200/200`,
        `https://picsum.photos/id/${101 + i}/200/200`,
        `https://picsum.photos/id/${102 + i}/200/200`,
      ]
    : [], // Empty array if no images
}));

export default function HistoryScreen() {
  const navigation = useNavigation();
  const [isSender, setIsSender] = useState<boolean>(true); // Explicitly typed
  const [tab, setTab] = useState<ShipmentTab>('ongoing'); // Explicitly typed
  const filteredOrders = mockOrders.filter(order => order.status === tab);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.5,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim]); // Added scaleAnim to dependencies

  // --- Transporter-related useEffect for role switch ---
  useEffect(() => {
    // When switching roles (sender/transporter), reset the navigation stack
    // to ensure you don't navigate back into an old screen from the previous role.
    // 'navigation.isFocused()' ensures this only happens when HistoryScreen is active.
    if (navigation.isFocused()) {
      navigation.dispatch(StackActions.popToTop()); // Navigates to the very first screen in the stack
    }
  }, [isSender, navigation]); // Dependencies: isSender (when it changes), navigation (for stability)
  // --- End Transporter-related useEffect ---


  return (
    <SafeAreaView className="flex-1 bg-white px-4 pt-6">
      <View className="flex-row justify-between mb-6">
        <Text className="text-xl font-semibold text-gray-800">Your History</Text>
        <View className="items-end">
          <Text className="text-sm text-gray-500 mb-1">Currently viewing as</Text>
          <View className="flex-row items-center space-x-2">
            <Text className="text-sm font-medium text-gray-600">{isSender ? 'Sender' : 'Transporter'}</Text>
            <Switch
              value={isSender}
              onValueChange={setIsSender}
              thumbColor={isSender ? '#FF5A5F' : '#ccc'}
              trackColor={{ false: '#ccc', true: '#FFBABA' }}
            />
          </View>
        </View>
      </View>

      <View className="flex-row bg-gray-100 p-1 rounded-xl mb-6">
        {(['ongoing', 'completed'] as ShipmentTab[]).map((t) => ( // Explicitly cast for type safety
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl ${tab === t ? 'bg-[#FF5A5F]' : ''}`}
          >
            <Text className={`text-center font-medium ${tab === t ? 'text-white' : 'text-gray-700'}`}>
              {t[0].toUpperCase() + t.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View className="bg-white rounded-2xl border border-gray-300 mb-5 shadow-md overflow-hidden">
            <Pressable
              android_ripple={{ color: '#eee' }}
              onPress={() => {
                if (isSender) {
                  // Navigate to sender's OrderDetails screen
                  // Using 'as any' to temporarily bypass TypeScript navigation type errors
                  (navigation as any).navigate('OrderDetails', { order: item });
                } else {
                  // Navigate to the TransporterOrderDetailsScreen
                  // Using 'as any' to temporarily bypass TypeScript navigation type errors
                  (navigation as any).navigate('TransporterOrderDetails', { order: item });
                }
              }}
              className="p-4"
            >
              <View className="flex-row justify-between mb-2">
                <Text className="text-base font-semibold text-gray-700">#{item.id}</Text>
                <Text className="text-base font-bold text-green-600">₹{item.amount}</Text>
              </View>
              <Text className="text-sm text-gray-500 mb-1">🕓 {item.date}, {item.time}</Text>
              <View className="flex-row justify-between items-center py-3">
                <Text className="text-sm text-gray-500">Type: Clothes</Text>
                <Text className="text-sm text-gray-500">Weight: 10kg(s)</Text>
              </View>

              <View className="mt-4 mb-2 items-center">
                <Svg width="100%" height={60} viewBox="0 0 320 60">
                  <Circle cx="10" cy="50" r="6" fill="#000" />
                  <Path d="M10 50 C 100 10, 220 10, 310 50" stroke="#aaa" strokeWidth={2} strokeDasharray="5,5" fill="none" />
                  <Circle cx="310" cy="50" r="6" fill="#000" />
                </Svg>
                <View className="flex-row justify-between w-full px-2 mt-2">
                  <Text className="text-xs text-gray-800">Hyderabad</Text>
                  <Text className="text-xs text-gray-800">Bangalore</Text>
                </View>
              </View>

              <View className="flex-row justify-center items-center flex-wrap gap-3 py-3">
                {[{
                  icon: faComments,
                  label: 'Chat Support',
                  screen: 'ChatSupport',
                  color: '#3131c4'
                }, {
                  icon: faPhone,
                  label: 'Call Support',
                  screen: 'CallSupport',
                  color: '#3737c6'
                }, {
                  icon: faMapMarkerAlt,
                  label: 'Track on Map',
                  screen: 'MapScreen',
                  // Hide if completed or if current user is Transporter
                  hide: tab === 'completed' || !isSender,
                  color: 'green'
                }, {
                  icon: faExclamationTriangle,
                  label: 'Report Issue',
                  screen: 'ReportIssue',
                  color: '#FF5A5F'
                }].map(({ icon, label, screen, hide, color }) => {
                  if (hide) return null; // Do not render the button if `hide` is true
                  return (
                    <TouchableOpacity
                      key={label}
                      activeOpacity={0.7}
                      // Using 'as any' for screen name here as well
                      onPress={() => (navigation as any).navigate(screen, { order: item })}
                      className="items-center w-[75px]"
                    >
                      <FontAwesomeIcon icon={icon} color={color} size={20} />
                      <Text className="text-[11px] text-gray-700 text-center mt-1 font-normal">{label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Pressable>
          </View>
        )}
      />
    </SafeAreaView>
  );
}