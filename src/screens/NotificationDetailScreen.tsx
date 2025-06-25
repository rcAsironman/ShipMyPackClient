import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function NotificationDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { data, markAsRead }: { data: any; markAsRead?: (id: string) => void } = route.params;

  useEffect(() => {
    if (!data.read && markAsRead) {
      markAsRead(data.id);
    }
  }, []);

  const handleDelete = () => {
    Alert.alert('Notification Deleted', 'This notification has been deleted.');
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View className="h-16 px-5 flex-row items-center justify-between border-b border-gray-100 bg-white shadow-sm">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FontAwesomeIcon icon={faArrowLeft} size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-black">Notification</Text>
        <View className="w-6" />
      </View>

      {/* Scrollable Full Message */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 36,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-[22px] font-bold text-black leading-snug mb-1">
          {data.title}
        </Text>
        <Text className="text-xs text-gray-400 mb-5">{data.timestamp}</Text>

        <Text className="text-[15px] text-gray-800 leading-[24px] tracking-[0.2px]">
          {data.fullMessage || data.message}
        </Text>
      </ScrollView>

      {/* Delete Button Only */}
      <View className="px-5 pb-6 pt-2 bg-white border-t border-gray-100">
        <TouchableOpacity
          onPress={handleDelete}
          className="border border-red-500 py-3 rounded-xl items-center active:opacity-90"
        >
          <Text className="text-red-500 font-semibold text-base">Delete</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
