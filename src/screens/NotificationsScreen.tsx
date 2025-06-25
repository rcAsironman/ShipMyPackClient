import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SwipeListView } from 'react-native-swipe-list-view';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBell, faTrash } from '@fortawesome/free-solid-svg-icons';

const MAX_MESSAGE_LENGTH = 70;
const ROW_HEIGHT = 96;

export default function NotificationScreen() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState(() =>
    Array.from({ length: 50 }).map((_, i) => {
      const date = new Date();
      const fullMessage =
        'Your package has been processed and will be shipped soon. Tap to view more info.';

      const message =
        fullMessage.length > MAX_MESSAGE_LENGTH
          ? fullMessage.slice(0, MAX_MESSAGE_LENGTH - 3) + '...'
          : fullMessage;

      return {
        id: `notif-${i}`,
        title: `Shipment Update #${i + 1}`,
        message,
        fullMessage,
        timestamp: `${date.toLocaleDateString()} • ${date.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}`,
        read: i % 3 !== 0, // every 3rd is unread
      };
    })
  );

  const deleteNotification = (rowKey: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== rowKey));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              read: true,
            }
          : n
      )
    );
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('NotificationDetail', {
          data: item,
          markAsRead: markNotificationAsRead,
        })
      }
      activeOpacity={0.9}
      className="bg-white mx-4 mb-4 rounded-2xl border border-gray-100 shadow-sm flex-row p-4"
      style={{ height: ROW_HEIGHT }}
    >
      <View className="w-12 h-12 rounded-full justify-center items-center mr-4 mt-2 bg-[#FFF1F0]">
        <FontAwesomeIcon icon={faBell} size={20} color="#DA2824" />
      </View>

      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold text-black" numberOfLines={1}>
            {item.title}
          </Text>
          {!item.read && (
            <View className="bg-red-100 px-2 py-[2px] -mt-4 rounded-full ml-2">
              <Text className="text-[10px] text-red-600 font-semibold">Unread</Text>
            </View>
          )}
        </View>

        <Text className="text-sm text-gray-600 mt-1" numberOfLines={1}>
          {item.message}
        </Text>
        <Text className="text-xs text-gray-400 mt-1">{item.timestamp}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHiddenItem = (data: any) => (
    <View
      className="bg-white mx-4 mb-4 rounded-2xl border border-gray-100 shadow-sm flex-row justify-end items-center px-4"
      style={{ height: ROW_HEIGHT }}
    >
      <TouchableOpacity
        className="bg-white px-4 py-3 rounded-xl items-center justify-center border border-red-500"
        onPress={() => deleteNotification(data.item.id)}
      >
        <FontAwesomeIcon icon={faTrash} size={16} color="#DA2824" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]">
      <StatusBar backgroundColor="white" barStyle="dark-content" />

      {/* Header */}
      <View className="h-16 px-5 flex-row items-center justify-between bg-white shadow-sm border-b border-gray-100">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-black">Notifications</Text>
        <View className="w-6" />
      </View>

      {/* List */}
      <SwipeListView
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderHiddenItem={renderHiddenItem}
        rightOpenValue={-80}
        disableRightSwipe
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}