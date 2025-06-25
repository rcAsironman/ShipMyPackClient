import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faBell, faTrash } from '@fortawesome/free-solid-svg-icons';

const MAX_MESSAGE_LENGTH = 70;
const ROW_HEIGHT = 96;
const { height } = Dimensions.get('window');

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
        read: i % 3 !== 0,
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
          ? { ...n, read: true }
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
    <View className="flex-1 bg-[#F9FAFB]">
      {/* StatusBar should be translucent so header can go under it */}
      <StatusBar backgroundColor="transparent" translucent barStyle="dark-content" />

      {/* Header overlaps status bar */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 44,
          paddingHorizontal: 16,
          height: height * 0.12,
          backgroundColor: 'white',
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          zIndex: 10,
        }}
        className="shadow-md"
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FontAwesomeIcon icon={faArrowLeft} size={24} color="black" />
        </TouchableOpacity>

        <Text style={{ fontSize: 20, fontWeight: '700', color: 'black' }}>Notifications</Text>

        <View style={{ width: 24 }} />
      </View>

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
    </View>
  );
}
