import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Platform,
  Dimensions,
  Animated,
  Modal,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
  StyleSheet
} from 'react-native';
import {  useRoute, RouteProp } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faArrowLeft,
  faShieldAlt,
  faBoxOpen,
  faTruck,
  faCheckCircle,
  faUpload,
  faComments,
  faPhone,
  faTimesCircle,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { pick, types, isCancel, DocumentPickerResponse } from '@react-native-documents/picker';
import FastImage from 'react-native-fast-image';
import OrderDetailsCarousel from './OrderDetailsCarousel';

// --- Type Definitions ---
interface ShipmentOrder {
  id: string;
  date: string;
  time: string;
  amount: number;
  status: 'ongoing' | 'completed';
  initialImages?: string[];
  senderName?: string;
  senderPhone?: string;
  senderGender?: string;
}

interface ShipmentStatus {
  pickedUp: boolean;
  inTransit: boolean;
  delivered: boolean;
}

type TransporterOrderDetailsRouteProp = RouteProp<
  { TransporterOrderDetails: { order: ShipmentOrder } },
  'TransporterOrderDetails'
>;
// --- End Type Definitions ---

const { width, height } = Dimensions.get('window');
const originalImages = [
    { uri: 'https://images.unsplash.com/photo-1532635042-a6f6ad4745f9?q=80' },
    { uri: 'https://images.unsplash.com/photo-1532635042-a6f6ad4745f9?q=80' },
    { uri: 'https://images.unsplash.com/photo-1532635042-a6f6ad4745f9?q=80' },
    // add more images here if needed
  ];



export default function TransporterOrderDetailsScreen({navigation}: {navigation: any}) {

  const route = useRoute<TransporterOrderDetailsRouteProp>();
  const { order } = route.params;

  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otp, setOtp] = useState<string>('');
  const [showOtpInput, setShowOtpInput] = useState<boolean>(true);

  const [senderName] = useState(order.senderName || 'Jane Smith');
  const [senderPhone] = useState(order.senderPhone || '+91 98765 43210');
  const [senderGender] = useState('Female');

  const [receiverName] = useState('Rahul Sharma');
  const [receiverPhone] = useState('+91 87654 32109');
  const [receiverGender] = useState('Male');

  const [shipmentStatus, setShipmentStatus] = useState<ShipmentStatus>({
    pickedUp: order.status === 'ongoing' || order.status === 'completed',
    inTransit: order.status === 'completed',
    delivered: order.status === 'completed',
  });

  
  const [imageRequestsCount, setImageRequestsCount] = useState(2); // Example count
  const [uploadedImages, setUploadedImages] = useState<string[]>([]); // State for uploaded images

  // Removed useEffect for "Image Requests Pending" alert

  const handleOtpVerification = () => {
    if (otp === '1234') { // Mock OTP
      setIsOtpVerified(true);
      setShowOtpInput(false);
      setOtp(''); // Clear OTP input
    } else {
      // No alert for invalid OTP as per request
    }
  };

  const handleStatusChange = (statusKey: keyof ShipmentStatus, value: boolean) => {
      // Only allow setting status to true, once true, it's disabled.
      // Or if the switch is being turned OFF (value is false), allow it (though usually not desired for statuses like "Delivered")
      if (value === true || (shipmentStatus[statusKey] === true && value === false)) {
          setShipmentStatus(prev => ({ ...prev, [statusKey]: value }));
      }
      // Keeping this alert as it's for general status update feedback, not image upload feedback.
      // If you want to remove this too, just uncomment the line below.
      // Alert.alert('Status Updated', `Shipment is now ${value ? statusKey.replace('Up', ' Up').replace('ed', 'ed') : 'Not ' + statusKey.replace('Up', ' Up').replace('ed', 'ed')}`);
  };

  const pickImage = async () => {
    try {
      const result: DocumentPickerResponse[] = await pick({
        type: [types.images()],
      });

      if (result && result.length > 0) {
        const uri = result[0].uri;
        setUploadedImages(prevImages => [...prevImages, uri]);
      } else {
        // User cancelled picker or no image selected, no alert needed
      }
    } catch (err) {
      if (isCancel(err)) {
        console.log('User cancelled image selection');
      } else {
        console.error('DocumentPicker Error:', err);
        // No alert for failure
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
         {/* Header */}
         <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <FontAwesomeIcon icon={faArrowLeft} size={20} color="#333" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">Order #{order.id}</Text>
          <View className="w-8" />
        </View>
      <ScrollView showsVerticalScrollIndicator={false}>
       

        <Text className="text-sm text-gray-600 text-center mb-4">Created on {order.date}, {order.time}</Text>

        {/* Integrated New Carousel Component */}
        <View style={styles.imageContainer}>
          <OrderDetailsCarousel images={originalImages}/>
        </View>

        {/* Requested Images Upload Section - Placed directly after carousel */}
        <View className="bg-white rounded-xl mx-4 my-2 p-4 shadow-md">
          <Text className="text-lg font-bold text-gray-800">Requested Images Upload</Text>
          <Text className="text-sm text-gray-700 mt-1 mb-2">
            You have <Text className="font-bold">{imageRequestsCount} pending requests</Text> for images from the sender. Please upload them here.
          </Text>
          <TouchableOpacity
            className="flex-row items-center justify-center bg-red-500 py-3 rounded-lg mt-4"
            onPress={pickImage}
          >
            <FontAwesomeIcon icon={faUpload} size={20} color="#FFFFFF" className="mr-2" />
            <Text className="text-white text-base font-bold">Upload Image</Text>
          </TouchableOpacity>

          {uploadedImages.length > 0 && (
            <View className="mt-5 border-t border-gray-200 pt-4">
              <Text className="text-base font-bold text-gray-700 mb-2.5">Images Sent by You:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {uploadedImages.map((uri, index) => (
                  <Image key={index} source={{ uri }} className="w-25 h-25 rounded-lg mr-2.5 border border-gray-300" />
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* --- Conditionally Rendered Content Below (visible only after OTP verification) --- */}
        {isOtpVerified && (
          <>
            {/* Sender Details Card */}
            <View className="bg-white rounded-xl mx-4 my-2 p-4 shadow-md">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-bold text-gray-800">Sender Details</Text>
                <TouchableOpacity className="items-center">
                  <FontAwesomeIcon icon={faShieldAlt} size={18} color="red" />
                  <Text className="text-[10px] text-red-500 mt-0.5">SOS</Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row items-center mt-2">
                <Image
                  source={{ uri: 'https://randomuser.me/api/portraits/women/32.jpg' }}
                  className="w-15 h-15 rounded-full mr-3 border-2 border-gray-300"
                />
                <View>
                  <Text className="text-base font-semibold text-gray-800 mb-1">{senderName}</Text>
                  <Text className="text-sm text-gray-700 mb-0.5">{senderPhone}</Text>
                  <Text className="text-sm text-gray-700">Gender: {senderGender}</Text>
                  <View className="flex-row mt-2">
                    <TouchableOpacity className="p-2 rounded-full bg-gray-100 mr-3">
                      <FontAwesomeIcon icon={faComments} size={20} color="#FF5A5F" />
                    </TouchableOpacity>
                    <TouchableOpacity className="p-2 rounded-full bg-gray-100">
                      <FontAwesomeIcon icon={faPhone} size={20} color="#FF5A5F" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* Receiver Details Card */}
            <View className="bg-white rounded-xl mx-4 my-2 p-4 shadow-md">
              <Text className="text-lg font-bold text-gray-800">Receiver Details</Text>
              <Text className="text-sm text-gray-700">Name: {receiverName}</Text>
              <Text className="text-sm text-gray-700">Phone: {receiverPhone}</Text>
              <Text className="text-sm text-gray-700">Gender: {receiverGender}</Text>
            </View>

            {/* Shipment Status Card */}
            <View className="bg-white rounded-xl mx-4 my-2 p-4 shadow-md">
              <Text className="text-lg font-bold text-gray-800">Update Shipment Status</Text>
              <View className="flex-row items-center justify-between py-2 border-b border-gray-200">
                <View className="flex-row items-center">
                  <FontAwesomeIcon icon={faBoxOpen} size={16} color="#3B82F6" className="mr-2" />
                  <Text className="text-base text-gray-700">Picked Up</Text>
                </View>
                <Switch
                  value={shipmentStatus.pickedUp}
                  onValueChange={(value) => handleStatusChange('pickedUp', value)}
                  thumbColor={shipmentStatus.pickedUp ? '#4CAF50' : (Platform.OS === 'android' ? '#f4f3f4' : '#E9E9EA')}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  disabled={shipmentStatus.pickedUp} // Disable if already picked up
                />
              </View>
              <View className="flex-row items-center justify-between py-2 border-b border-gray-200">
                <View className="flex-row items-center">
                  <FontAwesomeIcon icon={faTruck} size={16} color="#FFA500" className="mr-2" />
                  <Text className="text-base text-gray-700">In Transit</Text>
                </View>
                <Switch
                  value={shipmentStatus.inTransit}
                  onValueChange={(value) => handleStatusChange('inTransit', value)}
                  thumbColor={shipmentStatus.inTransit ? '#FFA500' : (Platform.OS === 'android' ? '#f4f3f4' : '#E9E9EA')}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  disabled={shipmentStatus.inTransit || !shipmentStatus.pickedUp} // Disable if in transit, or if not yet picked up
                />
              </View>
              <View className="flex-row items-center justify-between py-2">
                <View className="flex-row items-center">
                  <FontAwesomeIcon icon={faCheckCircle} size={16} color="#16a34a" className="mr-2" />
                  <Text className="text-base text-gray-700">Delivered</Text>
                </View>
                <Switch
                  value={shipmentStatus.delivered}
                  onValueChange={(value) => handleStatusChange('delivered', value)}
                  thumbColor={shipmentStatus.delivered ? '#007BFF' : (Platform.OS === 'android' ? '#f4f3f4' : '#E9E9EA')}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  disabled={shipmentStatus.delivered || !shipmentStatus.inTransit} // Disable if delivered, or if not yet in transit
                />
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* OTP Input Overlay (Only shown on first load until verified) */}
      {showOtpInput && (
        <View className="absolute inset-0 bg-black/60 justify-center items-center z-50">
          <View className="bg-white rounded-xl p-5 w-4/5 items-center shadow-lg">
            <Text className="text-lg font-bold mb-4 text-center">Verify Order to View Details</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-lg text-center w-full mb-4"
              placeholder="Enter 4-digit OTP (e.g., 1234)"
              keyboardType="numeric"
              maxLength={4}
              value={otp}
              onChangeText={setOtp}
              autoFocus
            />
            <TouchableOpacity
              onPress={handleOtpVerification}
              className="bg-blue-600 py-3 px-6 rounded-lg mb-3 w-full items-center"
            >
              <Text className="text-white text-base font-bold">Verify OTP & Proceed</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="bg-gray-300 py-2.5 px-5 rounded-lg w-full items-center"
            >
              <Text className="text-gray-800 text-base">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    imageContainer: {
        width: width - 32,
        height: 200,
        alignSelf: 'center',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
        backgroundColor: '#eee',
      },
})