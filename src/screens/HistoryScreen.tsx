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
  Image,
} from 'react-native';
import { useNavigation, StackActions } from '@react-navigation/native';
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
// IMPORTANT: Keep these type definitions consistent across files if possible,
// or consider moving them to a shared types file (e.g., `src/types/index.ts`)
interface ShipmentOrder {
  id: string;
  date: string;
  time: string;
  amount: number; // Total order amount (general)
  status: 'ongoing' | 'completed';
  initialImages?: string[]; // Images for the carousel

  // NEW: Add all fields expected by TransporterCompletedScreen
  shipmentAmount: number; // Amount specific to this shipment
  earnedAmount?: number; // Earnings for transporter, only for completed orders
  startPoint: string;
  destination: string;
  senderName: string;
  senderPhone: string;
  senderGender: string;
  receiverName: string;
  receiverPhone: string;
  receiverGender: string;
  senderRating: number;
}

type ShipmentTab = 'ongoing' | 'completed';
// --- End Type Definitions ---

// IMPORTANT: Adjust these paths based on your project structure
import TransporterOngoingScreen from './TransporterOngoing';
import TransporterCompletedScreen from './TransporterCompleted';

// --- UPDATED Mock data for demonstration ---
// This mock data now includes ALL the details that TransporterCompletedScreen expects.
const mockOrders: ShipmentOrder[] = Array.from({ length: 12 }, (_, i) => {
  const status = i % 2 === 0 ? 'ongoing' : 'completed';
  const hasImages = i % 3 !== 0; // Ensure some have images, others don't for variety
  const baseId = 10000 + i;

  return {
    id: `ORD${baseId}`,
    date: '2025-06-18',
    time: '10:30 AM',
    amount: Math.floor(Math.random() * 500 + 100), // General order value
    status: status,
    initialImages: hasImages
      ? [
          `https://picsum.photos/id/${baseId}/200/200`,
          `https://picsum.photos/id/${baseId + 1}/200/200`,
          `https://picsum.photos/id/${baseId + 2}/200/200`,
        ]
      : [],
    // --- Detailed properties for Transporter screens ---
    shipmentAmount: 150 + (i * 10), // Specific payment for the transporter for this shipment
    earnedAmount: status === 'completed' ? 200 + (i * 5) : undefined, // Only earned if completed
    startPoint: i % 3 === 0 ? 'Hyderabad, Telangana' : (i % 3 === 1 ? 'Delhi, India' : 'Mumbai, Maharashtra'),
    destination: i % 3 === 0 ? 'Bangalore, Karnataka' : (i % 3 === 1 ? 'Chennai, Tamil Nadu' : 'Kolkata, West Bengal'),
    senderName: `Sender ${i + 1}`,
    senderPhone: `+91 98765 432${String(10 + i).padStart(2, '0')}`,
    senderGender: i % 2 === 0 ? 'Male' : 'Female',
    receiverName: `Receiver ${i + 1}`,
    receiverPhone: `+91 87654 321${String(10 + i).padStart(2, '0')}`,
    receiverGender: i % 2 === 0 ? 'Female' : 'Male',
    senderRating: parseFloat(((3.5 + (i * 0.1)) > 5 ? 5 : (3.5 + (i * 0.1))).toFixed(1)),
  };
});
// --- End UPDATED Mock data ---


export default function HistoryScreen() {
  const navigation = useNavigation();
  const [isSender, setIsSender] = useState<boolean>(true);
  const [tab, setTab] = useState<ShipmentTab>('ongoing');
  const filteredOrders = mockOrders.filter(order => order.status === tab);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1, // Slightly less aggressive scale for loop
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
  }, [scaleAnim]);

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
        {(['ongoing', 'completed'] as ShipmentTab[]).map((t) => (
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
                  if (tab === 'ongoing') {
                    (navigation as any).navigate('SenderOngoing', { orderId: 1 });
                  } else {
                    // Pass the complete item directly to TransporterCompleted
                    (navigation as any).navigate('SenderCompleted', { orderId: 1 });
                  }
                } else {
                  if (tab === 'ongoing') {
                    (navigation as any).navigate('TransporterOngoing', { order: item });
                  } else {
                    // Pass the complete item directly to TransporterCompleted
                    (navigation as any).navigate('TransporterCompleted', { order: item });
                  }
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
                  hide: tab === 'completed' || !isSender,
                  color: 'green'
                }, {
                  icon: faExclamationTriangle,
                  label: 'Report Issue',
                  screen: 'ReportIssue',
                  color: '#FF5A5F'
                }].map(({ icon, label, screen, hide, color }) => {
                  if (hide) return null;
                  return (
                    <TouchableOpacity
                      key={label}
                      activeOpacity={0.7}
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