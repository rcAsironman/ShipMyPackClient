import React, { useState, useRef } from 'react';
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
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  PermissionsAndroid, // Added for permission handling, similar to TransporterOngoing.tsx
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faCreditCard,
  faMoneyBillWave,
  faAward,
  faShareAlt,
  faInfoCircle,
  faLock,
  faBell,
  faSignOutAlt,
  faEdit,
  faTimes,
  faUniversity, // For Bank Account
  faQrcode, // For UPI ID
  faTrashAlt, // For delete
} from '@fortawesome/free-solid-svg-icons';
// Removed: import { pick, types, isCancel, DocumentPickerResponse } from '@react-native-documents/picker';
import { Modalize } from 'react-native-modalize';
import { launchImageLibrary, launchCamera, Asset } from 'react-native-image-picker'; // Keep launchCamera as it might be useful in the future, even if not directly used now for profile pic

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
  accent: '#007AFF', // A professional blue accent
};

// --- Interfaces for Type Safety (Optional but good practice) ---
interface BankAccountDetails {
  bankName: string;
  accountNumber: string;
  ifsc: string;
  holderName: string;
}

interface UPIDetails {
  upiId: string;
  name: string;
}

interface PaymentMethod {
  id: string;
  type: 'Bank Account' | 'UPI ID';
  details: BankAccountDetails | UPIDetails;
}

// Dummy data for previously added payment methods
const initialPaymentMethods: PaymentMethod[] = [
  { id: '1', type: 'Bank Account', details: { bankName: 'State Bank of India', accountNumber: '1234567891234', ifsc: 'SBIN0001234', holderName: 'John Doe' } },
  { id: '2', type: 'UPI ID', details: { upiId: 'john.doe@paytm', name: 'John Doe' } },
];

const ProfileScreen = ({ navigation }: { navigation: any }) => {
  const insets = useSafeAreaInsets();
  const [imagePreviewModalVisible, setImagePreviewModalVisible] = useState(false);
  // Initialize with a default profile picture or keep it empty if dynamic
  const [currentProfilePictureUri, setCurrentProfilePictureUri] = useState(''); // Example default image

  const detailModalRef = useRef<Modalize>(null);
  const [modalContentKey, setModalContentKey] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  // States for Payment Settings
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(initialPaymentMethods);
  const [selectedPaymentMethodType, setSelectedPaymentMethodType] = useState<'Bank Account' | 'UPI ID' | null>(null);
  const [bankDetails, setBankDetails] = useState<Omit<BankAccountDetails, 'accountNumber'> & { accountNumber: string, confirmAccountNumber: string }>({ bankName: '', accountNumber: '', confirmAccountNumber: '', ifsc: '', holderName: '' });
  const [upiDetails, setUpiDetails] = useState<UPIDetails>({ upiId: '', name: '' });

  const openDetailModal = (key: string, title: string) => {
    setModalContentKey(key);
    setModalTitle(title);
    detailModalRef.current?.open();
  };

  const handleProfilePicturePress = () => {
    setImagePreviewModalVisible(true);
  };

  const closeImagePreviewModal = () => {
    setImagePreviewModalVisible(false);
  };

  // Function to request read permissions for images/videos
  const requestMediaPermissions = async () => {
    if (Platform.OS === 'android') {
      const apiLevel = Platform.Version;

      const READ_EXTERNAL_STORAGE =
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
      const READ_MEDIA_IMAGES =
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
      const READ_MEDIA_VIDEO =
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO;

      const permissions =
        apiLevel >= 33
          ? [READ_MEDIA_IMAGES, READ_MEDIA_VIDEO]
          : [READ_EXTERNAL_STORAGE];

      try {
        const granted = await PermissionsAndroid.requestMultiple(permissions);
        const allPermissionsGranted = Object.values(granted).every(
          status => status === PermissionsAndroid.RESULTS.GRANTED,
        );

        if (!allPermissionsGranted) {
          Alert.alert(
            'Permission Denied',
            'Storage permission is required to select images.',
          );
          return false;
        }
      } catch (err) {
        console.warn(err);
        Alert.alert('Permission Error', 'Failed to request permissions.');
        return false;
      }
    }
    return true;
  };

  const handleEditImage = async () => {
    const hasPermission = await requestMediaPermissions();
    if (!hasPermission) {
      return;
    }

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo', // Only allow photos
        quality: 0.7,
        selectionLimit: 1, // Only allow picking one image
      });

      if (result.didCancel) {
        console.log('User cancelled image selection');
      } else if (result.errorCode) {
        console.error('ImagePicker Error: ', result.errorMessage);
        Alert.alert('Error', `Failed to pick image: ${result.errorMessage}. Please try again.`);
      } else if (result.assets && result.assets.length > 0) {
        const selectedImageUri = result.assets[0].uri;
        if (selectedImageUri) {
          setCurrentProfilePictureUri(selectedImageUri);
          setImagePreviewModalVisible(false); // Close the preview modal after selection
        }
      }
    } catch (err) {
      console.error('ImagePicker Error:', err);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const addPaymentMethod = () => {
    if (selectedPaymentMethodType === 'Bank Account') {
      if (!bankDetails.bankName || !bankDetails.accountNumber || !bankDetails.confirmAccountNumber || !bankDetails.ifsc || !bankDetails.holderName) {
        Alert.alert('Error', 'Please fill all bank account details.');
        return;
      }
      if (bankDetails.accountNumber !== bankDetails.confirmAccountNumber) {
        Alert.alert('Error', 'Account numbers do not match.');
        return;
      }
      setPaymentMethods([
        ...paymentMethods,
        {
          id: String(Date.now()),
          type: 'Bank Account',
          details: {
            bankName: bankDetails.bankName,
            accountNumber: bankDetails.accountNumber,
            ifsc: bankDetails.ifsc,
            holderName: bankDetails.holderName,
          },
        },
      ]);
      Alert.alert('Success', 'Bank Account added successfully!');
      setSelectedPaymentMethodType(null); // Reset selection
      setBankDetails({ bankName: '', accountNumber: '', confirmAccountNumber: '', ifsc: '', holderName: '' }); // Clear fields
    } else if (selectedPaymentMethodType === 'UPI ID') {
      if (!upiDetails.upiId || !upiDetails.name) {
        Alert.alert('Error', 'Please fill all UPI ID details.');
        return;
      }
      setPaymentMethods([
        ...paymentMethods,
        {
          id: String(Date.now()),
          type: 'UPI ID',
          details: {
            upiId: upiDetails.upiId,
            name: upiDetails.name,
          },
        },
      ]);
      Alert.alert('Success', 'UPI ID added successfully!');
      setSelectedPaymentMethodType(null); // Reset selection
      setUpiDetails({ upiId: '', name: '' }); // Clear fields
    }
  };

  const removePaymentMethod = (id: string) => {
    Alert.alert(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(paymentMethods.filter((method) => method.id !== id));
            Alert.alert('Success', 'Payment method removed.');
          },
        },
      ]
    );
  };

  // This function will render content based on the `modalContentKey`
  const renderDetailModalContent = () => {
    switch (modalContentKey) {
      case 'PaymentSettings':
        return (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              <Text className="text-xl font-bold text-[#212121] mb-4">Manage Payment Methods</Text>

              {/* Display Previous Payment Details if they exist */}
              {paymentMethods.length > 0 && (
                <View className="mb-6">
                  <Text className="text-lg font-semibold text-[#212121] mb-3">Your Saved Payment Methods</Text>
                  {paymentMethods.map((method) => (
                    <View key={method.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3 flex-row items-center justify-between shadow-sm">
                      <View className="flex-1 mr-4">
                        <Text className="text-base font-semibold text-[#212121]">{method.type}</Text>
                        {method.type === 'Bank Account' ? (
                          <>
                            <Text className="text-sm text-[#666666] mt-1">{method.details.bankName} - XXXX{(method.details as BankAccountDetails).accountNumber.slice(-4)}</Text>
                            <Text className="text-sm text-[#666666]">Holder: {(method.details as BankAccountDetails).holderName}</Text>
                          </>
                        ) : (
                          <Text className="text-sm text-[#666666] mt-1">{(method.details as UPIDetails).upiId}</Text>
                        )}
                      </View>
                      <TouchableOpacity onPress={() => removePaymentMethod(method.id)} className="p-2 rounded-full bg-red-100">
                        <FontAwesomeIcon icon={faTrashAlt} size={20} color={NW_COLORS.danger} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <Text className="text-lg font-semibold text-[#212121] mb-3">Add New Payment Method</Text>

              {/* Ask user to add payment method type (Bank Account / UPI ID) */}
              {!selectedPaymentMethodType ? (
                <View>
                  <TouchableOpacity
                    className="flex-row items-center justify-center bg-blue-50 rounded-lg py-4 mb-3 border border-blue-200"
                    onPress={() => setSelectedPaymentMethodType('Bank Account')}
                  >
                    <FontAwesomeIcon icon={faUniversity} size={24} color={NW_COLORS.accent} />
                    <Text className="text-lg font-semibold text-blue-800 ml-3">Bank Account</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-row items-center justify-center bg-green-50 rounded-lg py-4 border border-green-200"
                    onPress={() => setSelectedPaymentMethodType('UPI ID')}
                  >
                    <FontAwesomeIcon icon={faQrcode} size={24} color={'#28A745'} />
                    <Text className="text-lg font-semibold text-green-800 ml-3">UPI ID</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                // Allow user to provide input in fields once a type is selected
                <View>
                  {selectedPaymentMethodType === 'Bank Account' && (
                    <View>
                      <TextInput
                        className="border border-gray-300 rounded-lg p-3 mb-3 text-base text-gray-800"
                        placeholder="Bank Name"
                        value={bankDetails.bankName}
                        onChangeText={(text) => setBankDetails({ ...bankDetails, bankName: text })}
                      />
                      <TextInput
                        className="border border-gray-300 rounded-lg p-3 mb-3 text-base text-gray-800"
                        placeholder="Account Holder Name"
                        value={bankDetails.holderName}
                        onChangeText={(text) => setBankDetails({ ...bankDetails, holderName: text })}
                      />
                      <TextInput
                        className="border border-gray-300 rounded-lg p-3 mb-3 text-base text-gray-800"
                        placeholder="Account Number"
                        keyboardType="numeric"
                        value={bankDetails.accountNumber}
                        onChangeText={(text) => setBankDetails({ ...bankDetails, accountNumber: text })}
                      />
                      <TextInput
                        className="border border-gray-300 rounded-lg p-3 mb-3 text-base text-gray-800"
                        placeholder="Confirm Account Number"
                        keyboardType="numeric"
                        value={bankDetails.confirmAccountNumber}
                        onChangeText={(text) => setBankDetails({ ...bankDetails, confirmAccountNumber: text })}
                      />
                      <TextInput
                        className="border border-gray-300 rounded-lg p-3 mb-3 text-base text-gray-800"
                        placeholder="IFSC Code"
                        autoCapitalize="characters"
                        value={bankDetails.ifsc}
                        onChangeText={(text) => setBankDetails({ ...bankDetails, ifsc: text })}
                      />
                      <TouchableOpacity
                        className="bg-blue-600 rounded-lg py-4 items-center mb-3 shadow-sm"
                        onPress={addPaymentMethod}
                      >
                        <Text className="text-white text-lg font-semibold">Add Bank Account</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {selectedPaymentMethodType === 'UPI ID' && (
                    <View>
                      <TextInput
                        className="border border-gray-300 rounded-lg p-3 mb-3 text-base text-gray-800"
                        placeholder="UPI ID (e.g., user@bank)"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={upiDetails.upiId}
                        onChangeText={(text) => setUpiDetails({ ...upiDetails, upiId: text })}
                      />
                      <TextInput
                        className="border border-gray-300 rounded-lg p-3 mb-3 text-base text-gray-800"
                        placeholder="Name (as per UPI)"
                        value={upiDetails.name}
                        onChangeText={(text) => setUpiDetails({ ...upiDetails, name: text })}
                      />
                      <TouchableOpacity
                        className="bg-green-600 rounded-lg py-4 items-center mb-3 shadow-sm"
                        onPress={addPaymentMethod}
                      >
                        <Text className="text-white text-lg font-semibold">Add UPI ID</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {/* Cancel button to go back to type selection */}
                  <TouchableOpacity
                    className="bg-gray-200 rounded-lg py-3 items-center"
                    onPress={() => {
                      setSelectedPaymentMethodType(null);
                      setBankDetails({ bankName: '', accountNumber: '', confirmAccountNumber: '', ifsc: '', holderName: '' });
                      setUpiDetails({ upiId: '', name: '' });
                    }}
                  >
                    <Text className="text-gray-800 text-base font-semibold">Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        );
      case 'Wallet':
        return (
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <Text className="text-xl font-bold text-[#212121] mb-4">Your Wallet Balance</Text>
            <View className="flex-row items-center justify-between bg-green-50 rounded-lg p-4 mb-6">
              <Text className="text-lg font-medium text-green-700">Current Balance:</Text>
              <Text className="text-3xl font-bold text-green-800">₹ 1,250.00</Text>
            </View>
            <Text className="text-base text-[#666666] mb-6">
              Your wallet offers a convenient way to pay for services. Top up your balance
              instantly or review your past transactions.
            </Text>
            <TouchableOpacity className="bg-green-600 rounded-lg py-4 items-center mb-4 shadow-sm">
              <Text className="text-white text-lg font-semibold">Top Up Wallet</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-100 border border-gray-300 rounded-lg py-4 items-center shadow-sm" onPress={() => Alert.alert("Transaction History", "This action is not implemented yet.")}>
              <Text className="text-gray-800 text-lg font-semibold">View Transaction History</Text>
            </TouchableOpacity>
          </ScrollView>
        );
      case 'Coupons':
        return (
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <Text className="text-xl font-bold text-[#212121] mb-4">Exclusive Coupons & Rewards</Text>
            <Text className="text-base text-[#666666] mb-6">
              Discover and apply your personalized coupons and exciting rewards
              to enjoy discounts on your next orders.
            </Text>
            {/* Example Coupon Cards */}
            <View className="bg-yellow-100 border border-yellow-400 p-4 rounded-lg mb-4 shadow-sm">
              <Text className="text-lg font-bold text-yellow-800 mb-1">SAVE20</Text>
              <Text className="text-base text-yellow-700 mb-2">Get 20% off on orders above ₹700</Text>
              <Text className="text-sm text-yellow-600">Expires: 31st Dec 2025</Text>
            </View>
            <View className="bg-blue-100 border border-blue-400 p-4 rounded-lg mb-4 shadow-sm">
              <Text className="text-lg font-bold text-blue-800 mb-1">FREEDELIVERY</Text>
              <Text className="text-base text-blue-700 mb-2">Free delivery on your next 3 orders</Text>
              <Text className="text-sm text-blue-600">Valid for 7 days</Text>
            </View>
            <TouchableOpacity className="bg-airbnb-primary rounded-lg py-4 items-center mt-4 shadow-sm">
              <Text className="text-white text-lg font-semibold">Browse All Offers</Text>
            </TouchableOpacity>
          </ScrollView>
        );
      case 'ShareApp':
        return (
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <Text className="text-xl font-bold text-[#212121] mb-4">Share ShipMyPack</Text>
            <Text className="text-base text-[#666666] mb-6">
              Help your friends and family discover the convenience of ShipMyPack.
              Share our app and spread the word!
            </Text>
            <TouchableOpacity className="bg-green-600 rounded-lg py-4 items-center mb-4 shadow-sm" onPress={() => Alert.alert("Share", "Sharing via native share sheet...")}>
              <Text className="text-white text-lg font-semibold">Share via WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-blue-600 rounded-lg py-4 items-center shadow-sm" onPress={() => Alert.alert("Share", "Sharing via Facebook...")}>
              <Text className="text-white text-lg font-semibold">Share on Social Media</Text>
            </TouchableOpacity>
            <Text className="text-center text-sm text-[#666666] mt-6">
              Thank you for helping us grow!
            </Text>
          </ScrollView>
        );
      case 'AboutUs':
        return (
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <Text className="text-xl font-bold text-[#212121] mb-4">About ShipMyPack</Text>
            <Text className="text-base text-[#666666] mb-4">
              ShipMyPack is dedicated to providing efficient, reliable, and affordable shipping solutions.
              Our mission is to simplify logistics for businesses and individuals alike.
            </Text>
            <Text className="text-base text-[#666666] mb-4">
              Founded in 20XX, we leverage cutting-edge technology and a network of trusted partners
              to ensure your packages reach their destination safely and on time.
            </Text>
            <Text className="text-base text-[#666666] mb-6">
              We are committed to continuous improvement and customer satisfaction.
            </Text>
            <TouchableOpacity className="bg-gray-100 border border-gray-300 rounded-lg py-4 items-center shadow-sm" onPress={() => Alert.alert("Website", "Opening website...")}>
              <Text className="text-gray-800 text-lg font-semibold">Visit Our Website</Text>
            </TouchableOpacity>
          </ScrollView>
        );
      case 'AccountPrivacy':
        return (
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <Text className="text-xl font-bold text-[#212121] mb-4">Account Privacy & Security</Text>
            <Text className="text-base text-[#666666] mb-4">
              Your privacy is our top priority. We use industry-standard encryption and security
              measures to protect your personal information and transaction data.
            </Text>
            <Text className="text-base text-[#666666] mb-6">
              Here you can manage your privacy settings, review our data policy,
              and take steps to further secure your account.
            </Text>
            <TouchableOpacity className="bg-blue-600 rounded-lg py-4 items-center mb-4 shadow-sm" onPress={() => Alert.alert("Privacy Policy", "Showing privacy policy...")}>
              <Text className="text-white text-lg font-semibold">Review Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-100 border border-gray-300 rounded-lg py-4 items-center shadow-sm" onPress={() => Alert.alert("Security", "Managing security settings...")}>
              <Text className="text-gray-800 text-lg font-semibold">Security Settings</Text>
            </TouchableOpacity>
          </ScrollView>
        );
      case 'NotificationPreferences':
        return (
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <Text className="text-xl font-bold text-[#212121] mb-4">Notification Preferences</Text>
            <Text className="text-base text-[#666666] mb-6">
              Control how you receive updates from ShipMyPack.
              Customize alerts for order status, promotions, and important announcements.
            </Text>
            <View className="mb-4">
              <Text className="text-lg font-medium text-[#212121] mb-2">Email Notifications:</Text>
              <TouchableOpacity className="bg-gray-100 border border-gray-300 rounded-lg py-3 px-4 flex-row justify-between items-center">
                <Text className="text-base text-gray-800">Order Updates</Text>
                <Text className="text-blue-500">On/Off Switch (Placeholder)</Text>
              </TouchableOpacity>
              {/* Add more switches for other notification types */}
            </View>
            <View className="mb-4">
              <Text className="text-lg font-medium text-[#212121] mb-2">Push Notifications:</Text>
              <TouchableOpacity className="bg-gray-100 border border-gray-300 rounded-lg py-3 px-4 flex-row justify-between items-center">
                <Text className="text-base text-gray-800">Promotions</Text>
                <Text className="text-blue-500">On/Off Switch (Placeholder)</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity className="bg-blue-600 rounded-lg py-4 items-center mt-4 shadow-sm" onPress={() => Alert.alert("Save", "Notification settings saved!")}>
              <Text className="text-white text-lg font-semibold">Save Preferences</Text>
            </TouchableOpacity>
          </ScrollView>
        );
      case 'Logout': // This case is handled by Alert, but included for completeness if modal were used
        return (
          <View className="p-4 items-center">
            <Text className="text-xl font-bold text-[#212121] mb-4">Log Out</Text>
            <Text className="text-base text-[#666666] mb-6 text-center">
              Are you sure you want to log out from your account?
            </Text>
            <TouchableOpacity className="bg-red-600 rounded-lg py-4 w-full items-center mb-4 shadow-sm" onPress={() => { detailModalRef.current?.close(); console.log('User logged out'); }}>
              <Text className="text-white text-lg font-semibold">Log Out</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-100 border border-gray-300 rounded-lg py-4 w-full items-center shadow-sm" onPress={() => detailModalRef.current?.close()}>
              <Text className="text-gray-800 text-lg font-semibold">Cancel</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return (
          <View className="p-4">
            <Text className="text-base text-gray-700">
              Content for {modalTitle} is not yet defined.
            </Text>
          </View>
        );
    }
  };


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
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        >
          {/* Your account section */}
          <View className="px-4 py-2.5 mt-2.5">
            <Text className="text-[13px] font-semibold text-[#666666] mb-3 ml-1 uppercase">Your account</Text>

            {/* Profile Picture, Name, Phone Number Section */}
            <View className="bg-white rounded-xl p-4 mb-2.5 flex-row items-center shadow-sm">
              {/* Profile Picture */}
              <TouchableOpacity onPress={handleProfilePicturePress} className="w-[70px] h-[70px] rounded-full overflow-hidden bg-[#F8F8F8] justify-center items-center mr-4">
                {/* Use currentProfilePictureUri for the Image source */}
                <Image source={currentProfilePictureUri} className="w-full h-full rounded-full" />
              </TouchableOpacity>

              {/* Name and Phone Number */}
              <View className="flex-1 justify-center">
                <Text className="text-xl font-bold text-[#212121] mb-0.5">John Doe</Text>
                <Text className="text-base text-[#666666]">+91-9989348841</Text>
              </View>
            </View>
          </View>

          {/* PAYMENT AND COUPONS section */}
          <View className="px-4 py-2.5 mt-2.5">
            <Text className="text-[13px] font-semibold text-[#666666] mb-3 ml-1 uppercase">PAYMENT AND COUPONS</Text>
            <TouchableOpacity className="flex-row items-center justify-between bg-white rounded-xl py-3.5 px-4 mb-2 shadow-sm" onPress={() => openDetailModal('PaymentSettings', 'Payment Settings')}>
              <View className="flex-row items-center">
                <FontAwesomeIcon icon={faCreditCard} size={20} color={NW_COLORS.textPrimary} />
                <Text className="text-base text-[#212121] ml-4 flex-1">Payment settings</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center justify-between bg-white rounded-xl py-3.5 px-4 mb-2 shadow-sm" onPress={() => openDetailModal('Wallet', 'My Wallet')}>
              <View className="flex-row items-center">
                <FontAwesomeIcon icon={faMoneyBillWave} size={20} color={NW_COLORS.textPrimary} />
                <Text className="text-base text-[#212121] ml-4 flex-1">Wallet</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center justify-between bg-white rounded-xl py-3.5 px-4 mb-2 shadow-sm" onPress={() => openDetailModal('Coupons', 'Coupons & Rewards')}>
              <View className="flex-row items-center">
                <FontAwesomeIcon icon={faAward} size={20} color={NW_COLORS.textPrimary} />
                <Text className="text-base text-[#212121] ml-4 flex-1">Coupons for you</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* OTHER INFORMATION section */}
          <View className="px-4 py-2.5 mt-2.5">
            <Text className="text-[13px] font-semibold text-[#666666] mb-3 ml-1 uppercase">OTHER INFORMATION</Text>
            <TouchableOpacity className="flex-row items-center justify-between bg-white rounded-xl py-3.5 px-4 mb-2 shadow-sm" onPress={() => openDetailModal('ShareApp', 'Share App')}>
              <View className="flex-row items-center">
                <FontAwesomeIcon icon={faShareAlt} size={20} color={NW_COLORS.textPrimary} />
                <Text className="text-base text-[#212121] ml-4 flex-1">Share the app</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center justify-between bg-white rounded-xl py-3.5 px-4 mb-2 shadow-sm" onPress={() => openDetailModal('AboutUs', 'About Us')}>
              <View className="flex-row items-center">
                <FontAwesomeIcon icon={faInfoCircle} size={20} color={NW_COLORS.textPrimary} />
                <Text className="text-base text-[#212121] ml-4 flex-1">About us</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-between bg-white rounded-xl py-3.5 px-4 mb-2 shadow-sm" onPress={() => openDetailModal('AccountPrivacy', 'Account Privacy')}>
              <View className="flex-row items-center">
                <FontAwesomeIcon icon={faLock} size={20} color={NW_COLORS.textPrimary} />
                <Text className="text-base text-[#212121] ml-4 flex-1">Account privacy</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center justify-between bg-white rounded-xl py-3.5 px-4 mb-2 shadow-sm" onPress={() => openDetailModal('NotificationPreferences', 'Notification Preferences')}>
              <View className="flex-row items-center">
                <FontAwesomeIcon icon={faBell} size={20} color={NW_COLORS.textPrimary} />
                <Text className="text-base text-[#212121] ml-4 flex-1">Notification preferences</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center justify-between bg-white rounded-xl py-3.5 px-4 mb-2 shadow-sm" onPress={() => Alert.alert('Log Out', 'Are you sure you want to log out?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Log Out', onPress: () => console.log('User logged out') }])}>
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
              source={ currentProfilePictureUri }
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

        {/* General Draggable Modal using react-native-modalize */}
        <Modalize
          ref={detailModalRef}
          // Conditionally apply modalHeight or adjustToContentHeight
          modalHeight={modalContentKey === 'PaymentSettings' ? screenHeight * 0.8 : undefined}
          adjustToContentHeight={modalContentKey !== 'PaymentSettings'}

          withHandle={true} // Shows the drag handle at the top
          handlePosition="inside" // Positions handle inside the modal
          modalStyle={styles.modalizeContainer} // Custom styles for modal appearance
          withReactModal={true} // Ensures proper full-screen behavior and keyboard handling
          scrollViewProps={{ keyboardShouldPersistTaps: 'handled' }} // Prevents keyboard dismissal on tap outside input
          HeaderComponent={
            <View className="py-4 px-4 border-b border-gray-200 flex-row justify-between items-center">
              <Text className="text-xl font-bold text-[#212121] flex-1 text-center">{modalTitle}</Text>
              <TouchableOpacity onPress={() => detailModalRef.current?.close()} className="p-2">
                <FontAwesomeIcon icon={faTimes} size={24} color={NW_COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          }
        >
          {renderDetailModalContent()}
        </Modalize>

      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  modalizeContainer: {
    backgroundColor: NW_COLORS.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden', // Ensures content respects border radius
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 40, // Add some bottom padding for scrollable content
  },
});

export default ProfileScreen;