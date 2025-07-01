import React, { useState } from 'react'; // Removed useRef, useCallback as they are no longer needed without BottomSheet
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Dimensions,
  Alert,
  Image,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faHeadset,
  faCreditCard,
  faBox,
  faBook,
  faMapMarkerAlt,
  faFileInvoiceDollar,
  faGift,
  faMoneyBillWave,
  faAward,
  faShareAlt,
  faInfoCircle,
  faReceipt,
  faLock,
  faBell,
  faSignOutAlt,
  faEdit, // Used for Edit Image button in modal
  faTimes, // Used for closing modals
} from '@fortawesome/free-solid-svg-icons';
import { pick, types, isCancel, DocumentPickerResponse } from '@react-native-documents/picker';

// Get screen dimensions for responsive layout and full-screen modal
const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

// Colors defined explicitly for NativeWind classes (can be moved to tailwind.config.js)
const NW_COLORS = {
  primaryBg: '#F8F8F8',
  textPrimary: '#212121',
  textSecondary: '#666666',
  cardBackground: '#FFFFFF',
  danger: '#DC3545',
  black: '#000000',
  headerShadow: 'rgba(0, 0, 0, 0.1)',
};

const ProfileScreen = ({ navigation }: { navigation: any }) => {
  const insets = useSafeAreaInsets();
  // Controls the full-screen image preview modal
  const [imagePreviewModalVisible, setImagePreviewModalVisible] = useState(false);
  // Profile picture URI state
  const [currentProfilePictureUri, setCurrentProfilePictureUri] = useState('https://media.licdn.com/dms/image/v2/C5603AQGaffS4u7szjw/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1621060030088?e=2147483647&v=beta&t=vE1XuR7uG5YbHzLltK4hu96nm5SwU486qnIGrijGzek');

  // Handler for generic navigation (now uses Alert.alert for all list items)
  const handleNavigation = (screenName: string) => {
    console.log(`Maps to ${screenName}`);
    // Reverted to Alert.alert as no bottom sheet package is available
    Alert.alert('Navigation', `Navigating to ${screenName} (Functionality not implemented)`);
  };

  // Handler for displaying the profile picture in full screen
  const handleProfilePicturePress = () => {
    setImagePreviewModalVisible(true);
  };

  // Handler for closing the full-screen image modal
  const closeImagePreviewModal = () => {
    setImagePreviewModalVisible(false);
  };

  // Function to handle image selection using @react-native-documents/picker
  const handleEditImage = async () => {
    try {
      // Use pick function, which returns an array of DocumentPickerResponse
      const [file]: DocumentPickerResponse[] = await pick({
        type: [types.images], // Specify that we want to pick image files
        copyTo: 'cachesDirectory', // Optional: copy the file to a cache directory
      });

      if (file) {
        console.log('Picked image URI:', file.uri);
        // Update the profile picture URI
        setCurrentProfilePictureUri(file.uri);
        // Close the image preview modal after picking
        setImagePreviewModalVisible(false);
      }
    } catch (err) {
      if (isCancel(err)) { // Use isCancel from the package
        // User cancelled the picker
        console.log('User cancelled image selection');
      } else {
        // A real error occurred
        console.error('DocumentPicker Error:', err);
        Alert.alert('Error', 'Failed to pick image. Please try again.');
      }
    }
  };

  // Calculate dynamic top padding for header and modal close button
  const headerPaddingTop = Platform.OS === 'android' ? (StatusBar?.currentHeight || 0) : screenHeight * 0.02;
  const modalCloseButtonTop = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : insets.top + 20;

  return (
    <>
       <SafeAreaView className="flex-1 bg-white">
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      {/* FIXED HEADER - Styled to match HomeScreen header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: Platform.OS === 'android' ? (StatusBar?.currentHeight || 0) : screenHeight * 0.02,
          paddingBottom: 20,
          paddingHorizontal: 16,
          backgroundColor: 'white',
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          zIndex: 10,
        }}
        className="shadow-md"
      >
         <Text style={{ fontSize: 20, fontWeight: '700', color: 'black', flex: 1, textAlign: 'center' }}>
          Profile
        </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        >
          {/* Your account section */}
          <View className="px-4 py-2.5 mt-2.5">
            <Text className="text-[13px] font-semibold text-[#666666] mb-3 ml-1 uppercase">Your account</Text>

            {/* Profile Picture, Name, Phone Number Section */}
            <View className="bg-white rounded-xl p-4 mb-2.5 flex-row items-center">
              {/* Profile Picture */}
              <TouchableOpacity onPress={handleProfilePicturePress} className="w-[70px] h-[70px] rounded-full overflow-hidden bg-[#F8F8F8] justify-center items-center mr-4">
                <Image source={{ uri: currentProfilePictureUri }} className="w-full h-full rounded-full" />
              </TouchableOpacity>

              {/* Name and Phone Number */}
              <View className="flex-1 justify-center">
                <Text className="text-xl font-bold text-[#212121] mb-0.5">John Doe</Text>
                <Text className="text-base text-[#666666]">+91-9989348841</Text>
                {/* Removed 'Edit Profile' option from here as requested */}
              </View>
            </View>

            {/* Quick Action Buttons */}
            <View className="flex-row justify-between mt-6 mb-2.5 gap-2">
              <TouchableOpacity className="flex-1 bg-white rounded-xl py-4 px-2.5 items-center justify-center" onPress={() => navigation.navigate('SupportScreen')}>
                <FontAwesomeIcon icon={faHeadset} size={24} color={NW_COLORS.textPrimary} />
                <Text className="mt-2 text-sm font-medium text-[#212121] text-center">Support</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* YOUR INFORMATION section */}
          <View className="px-4 py-2.5 mt-2.5">
            <Text className="text-[13px] font-semibold text-[#666666] mb-3 ml-1 uppercase">YOUR INFORMATION</Text>
            <TouchableOpacity className="flex-row items-center justify-between bg-white rounded-xl py-3.5 px-4 mb-2 border-0" onPress={() => handleNavigation('Your orders')}>
              <View className="flex-row items-center">
                <FontAwesomeIcon icon={faBox} size={20} color={NW_COLORS.textPrimary} />
                <Text className="text-base text-[#212121] ml-4 flex-1">Your orders</Text>
              </View>
            </TouchableOpacity>
           
            <TouchableOpacity className="flex-row items-center justify-between bg-white rounded-xl py-3.5 px-4 mb-2 border-0" onPress={() => handleNavigation('Address book')}>
              <View className="flex-row items-center">
                <FontAwesomeIcon icon={faMapMarkerAlt} size={20} color={NW_COLORS.textPrimary} />
                <Text className="text-base text-[#212121] ml-4 flex-1">Address book</Text>
              </View>
            </TouchableOpacity>
           
            
          </View>

          {/* PAYMENT AND COUPONS section */}
          <View className="px-4 py-2.5 mt-2.5">
            <Text className="text-[13px] font-semibold text-[#666666] mb-3 ml-1 uppercase">PAYMENT AND COUPONS</Text>
            <TouchableOpacity className="flex-row items-center justify-between bg-white rounded-xl py-3.5 px-4 mb-2 border-0" onPress={() => handleNavigation('Payment settings')}>
              <View className="flex-row items-center">
                <FontAwesomeIcon icon={faCreditCard} size={20} color={NW_COLORS.textPrimary} />
                <Text className="text-base text-[#212121] ml-4 flex-1">Payment settings</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center justify-between bg-white rounded-xl py-3.5 px-4 mb-2 border-0" onPress={() => handleNavigation('Wallet')}>
              <View className="flex-row items-center">
                <FontAwesomeIcon icon={faMoneyBillWave} size={20} color={NW_COLORS.textPrimary} />
                <Text className="text-base text-[#212121] ml-4 flex-1">Wallet</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center justify-between bg-white rounded-xl py-3.5 px-4 mb-2 border-0" onPress={() => handleNavigation('Your collected rewards')}>
              <View className="flex-row items-center">
                <FontAwesomeIcon icon={faAward} size={20} color={NW_COLORS.textPrimary} />
                <Text className="text-base text-[#212121] ml-4 flex-1">Coupons for you</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* OTHER INFORMATION section */}
          <View className="px-4 py-2.5 mt-2.5">
            <Text className="text-[13px] font-semibold text-[#666666] mb-3 ml-1 uppercase">OTHER INFORMATION</Text>
            <TouchableOpacity className="flex-row items-center justify-between bg-white rounded-xl py-3.5 px-4 mb-2 border-0" onPress={() => handleNavigation('Share the app')}>
              <View className="flex-row items-center">
                <FontAwesomeIcon icon={faShareAlt} size={20} color={NW_COLORS.textPrimary} />
                <Text className="text-base text-[#212121] ml-4 flex-1">Share the app</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center justify-between bg-white rounded-xl py-3.5 px-4 mb-2 border-0" onPress={() => handleNavigation('About us')}>
              <View className="flex-row items-center">
                <FontAwesomeIcon icon={faInfoCircle} size={20} color={NW_COLORS.textPrimary} />
                <Text className="text-base text-[#212121] ml-4 flex-1">About us</Text>
              </View>
            </TouchableOpacity>
           
            <TouchableOpacity className="flex-row items-center justify-between bg-white rounded-xl py-3.5 px-4 mb-2 border-0" onPress={() => handleNavigation('Account privacy')}>
              <View className="flex-row items-center">
                <FontAwesomeIcon icon={faLock} size={20} color={NW_COLORS.textPrimary} />
                <Text className="text-base text-[#212121] ml-4 flex-1">Account privacy</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center justify-between bg-white rounded-xl py-3.5 px-4 mb-2 border-0" onPress={() => handleNavigation('Notification preferences')}>
              <View className="flex-row items-center">
                <FontAwesomeIcon icon={faBell} size={20} color={NW_COLORS.textPrimary} />
                <Text className="text-base text-[#212121] ml-4 flex-1">Notification preferences</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center justify-between bg-white rounded-xl py-3.5 px-4 mb-2 border-0" onPress={() => Alert.alert('Log Out', 'Are you sure you want to log out?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Log Out', onPress: () => console.log('User logged out') }])}>
              <View className="flex-row items-center">
                <FontAwesomeIcon icon={faSignOutAlt} size={20} color={NW_COLORS.danger} />
                <Text className="text-base text-red-600 ml-4 flex-1" style={{ color: NW_COLORS.danger }}>Log out</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* ShipMyPack Branding at the bottom */}
          <View className="items-center py-6 mt-6">
            <Text className="text-2xl font-bold text-[#666666] opacity-80 tracking-wide uppercase">ShipMyPack</Text>
            <Text className="text-sm text-[#666666] mt-4 opacity-70">v17.12.1 (1)</Text>
          </View>
        </ScrollView>

        {/* Full-Screen Image Preview Modal */}
        <Modal
          animationType="fade"
          transparent
          visible={imagePreviewModalVisible}
          onRequestClose={closeImagePreviewModal}
        >
          <SafeAreaView
            edges={['top']}
            className="flex-1 bg-black/95 justify-center items-center relative"
          >
            {/* Close Button */}
            <TouchableOpacity
              onPress={closeImagePreviewModal}
              activeOpacity={0.7}
              className="absolute top-12 right-5 p-3 z-20 bg-gray-200 rounded-full"
              accessibilityLabel="Close Image Preview"
            >
              <FontAwesomeIcon icon={faTimes} size={28} color="#000" />
            </TouchableOpacity>

            {/* Image */}
            <Image
              source={{ uri: currentProfilePictureUri }}
              className="w-full h-[70%] max-h-[70%]"
              resizeMode="contain"
            />

            {/* Control Button */}
            <View className="w-full px-6 mt-6">
              <TouchableOpacity
                onPress={handleEditImage}
                activeOpacity={0.8}
                className="flex-row items-center justify-center bg-white rounded-xl py-3 space-x-2"
              >
                <FontAwesomeIcon icon={faEdit} size={20} color="#212121" />
                <Text className="text-base font-semibold text-[#212121]">
                  Edit Image
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>


        {/* No draggable bottom sheet modal here as the package is not available.
          If you need a modal for list items, you'll need to implement a standard
          React Native Modal component or install a dedicated library.
          Implementing "draggable" functionality from scratch is highly complex. */}

      </SafeAreaView>
    </>
  );
};

export default ProfileScreen;