import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  Dimensions,
  Modal,
  Animated,
  Easing,
  Keyboard,
  Linking,
  FlatList,
  PanResponder,
  TouchableWithoutFeedback,
  ActivityIndicator, // Import ActivityIndicator for loading state
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faCalendarAlt,
  faClock,
  faUpload,
  faTimesCircle,
  faArrowLeft,
  faCheckCircle,
  faFileWord,
  faTimes,
  faMapMarkerAlt,
  faRoad,
  faWeightHanging,
  faTicketAlt,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { pick, types, isCancel, DocumentPickerResponse } from '@react-native-documents/picker';
import Text from '../components/Text';

import axios from 'axios';
import { ENDPOINTS, SERVER_URL } from '../constants/constants';
import { useAuthStore } from '../store/authStore';
import DatePicker from 'react-native-date-picker';
import Toast from 'react-native-toast-message';

const { height: screenHeight } = Dimensions.get('window');

type locationsType = {
  id: number;
  place: string;
}

interface FileObject {
  uri: string;
  name?: string;
  type?: string;
  size?: number;
}

// --- CityPickerModal Component (unchanged from previous version, just ensuring it's included) ---
interface CityPickerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectCity: (city: number) => void;
  currentCity: number | null;
  excludedCity: number | null;
  allCities: locationsType[] | null;
}

const CityPickerModal: React.FC<CityPickerModalProps> = ({
  isVisible,
  onClose,
  onSelectCity,
  currentCity,
  excludedCity,
  allCities,
}) => {
  const [searchText, setSearchText] = useState<string>('');
  const [displayCities, setDisplayCities] = useState<locationsType[]>(allCities);

  const pan = useRef(new Animated.Value(screenHeight)).current;
  const initialModalHeight = screenHeight * 0.7;
  const fullModalHeight = screenHeight;

  const [currentModalVisible, setCurrentModalVisible] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setCurrentModalVisible(true);
      Animated.timing(pan, {
        toValue: screenHeight - initialModalHeight,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(pan, {
        toValue: screenHeight,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start(() => setCurrentModalVisible(false));
    }
  }, [isVisible, pan, initialModalHeight]);

  useEffect(() => {
    let results = allCities;

    if (searchText) {
      const lowerCaseSearch = searchText.toLowerCase();
      results = results?.filter(city => city.place.toLowerCase().includes(lowerCaseSearch));
    }

    if (excludedCity) {
      results = results?.filter(city => city.id !== excludedCity);
    }

    setDisplayCities(results || []);
  }, [searchText, excludedCity, allCities]);

  const handleCityPress = (city: number) => {
    onSelectCity(city);
    setSearchText('');
    onClose();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        pan.setValue(Math.max(0, screenHeight - initialModalHeight + gestureState.dy));
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 100) {
          onClose();
        } else if (gestureState.dy < -100 && pan._value < screenHeight / 2) {
          Animated.spring(pan, {
            toValue: 0,
            speed: 10,
            bounciness: 5,
            useNativeDriver: true,
          }).start();
        } else {
          Animated.spring(pan, {
            toValue: screenHeight - initialModalHeight,
            speed: 10,
            bounciness: 5,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!isVisible && !currentModalVisible) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <Modal animationType="none" transparent={true} visible={isVisible || currentModalVisible} onRequestClose={onClose}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={{
                  transform: [{ translateY: pan }],
                  backgroundColor: 'white',
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  padding: 5,
                  paddingBottom: Platform.OS === 'ios' ? 30 : 5,
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: fullModalHeight,
                }}
                {...panResponder.panHandlers}
              >
                <View className="items-center py-2">
                  <View className="w-16 h-1 bg-gray-300 rounded-full"></View>
                </View>

                <View className="flex-1 p-3">
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-xl font-bold text-gray-800">Select City</Text>
                    <TouchableOpacity onPress={onClose} className="p-2">
                      <FontAwesomeIcon icon={faTimes} size={24} color="#6B7280" />
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-2 mb-4 bg-gray-50">
                    <FontAwesomeIcon icon={faSearch} size={18} color="#9CA3AF" />
                    <TextInput
                      className="ml-3 flex-1 text-gray-800 text-base"
                      placeholder="Search for a city..."
                      placeholderTextColor="#9CA3AF"
                      value={searchText}
                      onChangeText={setSearchText}
                    />
                    {searchText.length > 0 && (
                      <TouchableOpacity onPress={() => setSearchText('')} className="p-1 ml-2">
                        <FontAwesomeIcon icon={faTimesCircle} size={20} color="#9CA3AF" />
                      </TouchableOpacity>
                    )}
                  </View>

                  <FlatList
                    data={displayCities}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{
                      paddingBottom: Platform.OS === 'ios' ? Keyboard.metrics?.height : 50,
                    }}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => handleCityPress(item.id)}
                        className={`py-3 px-2 border-b border-gray-200 ${item.id === currentCity ? 'bg-blue-100' : ''
                          }`}
                      >
                        <Text
                          className={`text-lg ${item.id === currentCity ? 'font-semibold text-black' : 'text-gray-800'
                            }`}
                        >
                          {item.place}
                          {item.id === currentCity && <Text className="text-sm text-gray-500 ml-2"> (Already Selected)</Text>}
                        </Text>
                      </TouchableOpacity>
                    )}
                    initialNumToRender={20}
                    maxToRenderPerBatch={10}
                    windowSize={21}
                    style={{ flexGrow: 1 }}
                    ListEmptyComponent={() => (
                      <View className="p-4 items-center">
                        <Text className="text-gray-500 text-base text-center">
                          Sorry, we are currently not serving at this place. Soon we will.
                        </Text>
                      </View>
                    )}
                  />
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </KeyboardAvoidingView>
  );
};
// --- End CityPickerModal Component ---


export default function AddTripScreen({ navigation }: { navigation: any }) {
  const [travelDate, setTravelDate] = useState<Date>(new Date());
  const [dropDate, setDropDate] = useState<Date>(new Date());
  const [pickupTime, setPickupTime] = useState<Date>(new Date());
  const [dropTime, setDropTime] = useState<Date>(new Date());
  const [ticketFile, setTicketFile] = useState<FileObject | null>(null);
  const [ticketFileUrl, setTicketFileUrl] = useState<string | null>(null); // NEW: To store the URL from backend
  const [weight, setWeight] = useState<string>('');
  const [startPincode, setStartPincode] = useState<string>('');
  const [startLocation, setStartLocation] = useState<number | null>(null);
  const [pickupPoint, setPickupPoint] = useState<string>('');
  const [destinationPincode, setDestinationPincode] = useState<string>('');
  const [destinationLocation, setDestinationLocation] = useState<number | null>(null);
  const [dropPoint, setDropPoint] = useState<string>('');

  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showDropDatePicker, setShowDropDatePicker] = useState<boolean>(false);
  const [showPickupTimePicker, setShowPickupTimePicker] = useState<boolean>(false);
  const [showDropTimePicker, setShowDropTimePicker] = useState<boolean>(false);

  const [showStartLocationPicker, setShowStartLocationPicker] = useState<boolean>(false);
  const [showDestinationLocationPicker, setShowDestinationLocationPicker] = useState<boolean>(false);

  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  const [tripDetailsToConfirm, setTripDetailsToConfirm] = useState<Record<string, string> | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;

  const [showFullPreviewModal, setShowFullPreviewModal] = useState<boolean>(false);
  const [previewFileUri, setPreviewFileUri] = useState<string | null>(null);

  const [cities, setCities] = useState<locationsType[] | null>(null);
  const inputStyle = 'border border-gray-300 px-4 py-3 rounded-xl bg-gray-50 text-gray-800 mb-4';
  const touchableInputStyle = 'flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 mb-4';
  const user = useAuthStore((state) => state.user);
  const [isUploading, setIsUploading] = useState<boolean>(false); // NEW: Loading state for file upload
  const [fileUrl, setFileUrl] = useState<string | null>(null); // NEW: To store the file URL after upload

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get(ENDPOINTS.FETCH_LOCATIONS);
        const data = response.data;
        if (Array.isArray(data) && data.length > 0) {
          const citiesData = data.map((item) => ({ id: item.id, place: item.place }));
          setCities(citiesData);
        } else {
          setCities([]);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch cities. Please try again later.');
        console.error('Error fetching cities:', error);
      }
    };

    fetchCities();
    return () => {
      setCities(null);
    };
  }, []);

  const handleSelectStartLocation = (city: number) => {
    setStartLocation(city);
    setShowStartLocationPicker(false);
  };

  const handleSelectDestinationLocation = (city: number) => {
    setDestinationLocation(city);
    setShowDestinationLocationPicker(false);
  };

  const handleUpload = async () => {
    setIsUploading(true); // Start loading indicator
    setTicketFile(null); // Clear previous file and URL on new upload attempt
    setTicketFileUrl(null);
    try {
      const [file]: DocumentPickerResponse[] = await pick({
        types: [
          'application/pdf',
          'application/msword', // .doc files
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx files
          'image/jpeg', // Add JPEG if you are also allowing images
          'image/png', // Add PNG if you are also allowing images
          // Add other image types if your backend supports them, given the 'imageKey' and 'imageUrl' in response
        ],
      });
  
      if (file) {
        console.log('Picked file:', file);
        setTicketFile({
          uri: file.uri,
          name: file.name || file.uri.split('/').pop(),
          type: file.type ?? '',
          size: file.size ?? undefined,
        });
  
        const formData = new FormData();
        // IMPORTANT: The field name here must match what your backend expects ("ticket_image")
        formData.append('ticket_image', {
          uri: file.uri,
          name: file.name || 'uploaded_file.bin', // Provide a fallback name
          type: file.type || 'application/octet-stream', // Provide a fallback type
        } as any); // Type assertion for React Native FormData
  
        console.log('FormData for upload:', JSON.stringify(formData)); // For debugging, though it won't show file content directly
  
        const uploadResponse = await axios.post(
          ENDPOINTS.UPLOAD_TICKET, // Your backend endpoint for file uploads
          formData, // Pass the formData object directly as the second argument
          {
            headers: {
              'Content-Type': 'multipart/form-data', // Axios will automatically set the boundary
              'Authorization': `Bearer ${user?.authToken}`, // Use user?.authToken for optional chaining
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = progressEvent.total ? Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0;
              Toast.show({
                type: 'info',
                text1: 'Uploading...',
                text2: `${percentCompleted}% uploaded`,
                visibilityTime: 2000,
                position: 'bottom'
              });
            },
          }
        );
  
        console.log('Upload response:', uploadResponse.data);
  
        if (uploadResponse.status === 200 || uploadResponse.status === 201) {
          // Extract the imageUrl from the response, as shown in your Swagger screenshot
          const fileKey = uploadResponse.data.imageKey;
          const fileUrl = uploadResponse.data.imageUrl;
          setFileUrl(fileUrl); // Store the file URL for later use
          setTicketFileUrl(fileKey); // Store the URL received from backend
          Toast.show({
            type: 'success',
            text1: 'File Uploaded!',
            text2: `Successfully uploaded ${file.name}.`,
            position: 'bottom'
          });
          console.log('File uploaded to URL:', fileKey);
        } else {
          // More robust error handling based on backend response
          throw new Error(uploadResponse.data?.message || `File upload failed with status: ${uploadResponse.status}`);
        }
  
      }
    } catch (err) {
      if (isCancel(err)) {
        console.log('User cancelled document picker');
        Toast.show({ type: 'info', text1: 'Upload Cancelled', text2: 'File selection was cancelled.', position: 'bottom' });
      } else {
        const errorMessage = `Error: ${(err as Error).message || 'Unknown error'}.`;
        console.error('Document Picker/Upload Error:', err);
        Toast.show({ type: 'error', text1: 'Upload Failed', text2: errorMessage, position: 'bottom' });
      }
      setTicketFile(null); // Clear file state if upload failed
      setTicketFileUrl(null); // Clear URL state if upload failed
    } finally {
      setIsUploading(false); // End loading indicator
    }
  };

  const clearTicketFile = () => {
    setTicketFile(null);
    setTicketFileUrl(null); // Also clear the URL
    setPreviewFileUri(null);

    Toast.show({
      type: 'info',
      text1: 'Ticket Cleared',
      text2: 'Your ticket file has been cleared.',
      position: 'bottom'
    });
  };

  const handlePreviewClick = () => {
    // Preview original local URI if available, or the uploaded URL
    if (fileUrl) {
      setPreviewFileUri(fileUrl); // Use local URI for preview if possible
      setShowFullPreviewModal(true);
    } else if (fileUrl) {
        // If only URL is available, maybe alert user or provide external open option directly
        Alert.alert("File Preview", "Preview not available in-app for this URL. Try opening externally.", [
            { text: "Open Externally", onPress: () => Linking.openURL(fileUrl) },
            { text: "Cancel", style: "cancel" }
        ]);
    }
  };

  const handleOpenExternally = async () => {
    if (fileUrl) {
      try {
        await Linking.openURL(fileUrl || "");
      } catch (error) {
        Alert.alert('Cannot Open File', 'No app found to open this file type, or an error occurred.');
        console.error('Error opening file externally:', error);
      }
    } else if (fileUrl) { // Fallback to open the URL externally
        try {
            await Linking.openURL(fileUrl);
        } catch (error) {
            Alert.alert('Cannot Open File', 'No app found to open this file type, or an error occurred.');
            console.error('Error opening uploaded URL externally:', error);
        }
    }
  };

  const clearTripDetails = () => {
    setTravelDate(new Date());
    setDropDate(new Date());
    setPickupTime(new Date());
    setDropTime(new Date());
    setTicketFile(null);
    setTicketFileUrl(null); // Clear URL on form reset
    setWeight('');
    setStartPincode('');
    setStartLocation(null);
    setPickupPoint('');
    setDestinationPincode('');
    setDestinationLocation(null);
    setDropPoint('');
    setPreviewFileUri(null);
  };

  const handleSubmit = async () => {
    // --- 1. Basic Validation ---
    if (!user || !user.authToken || !user.id) {
      Toast.show({
        type: 'error',
        text1: 'Authentication Error',
        text2: 'User not logged in or token missing. Please log in again.',
        position: 'bottom'
      });
      return;
    }

    // --- MODIFIED: Ensure ticketFileUrl exists instead of ticketFile ---
    if (
      !travelDate || !dropDate || !pickupTime || !dropTime ||
      !weight || !startPincode || !startLocation || !pickupPoint ||
      !destinationPincode || !destinationLocation || !dropPoint || !ticketFileUrl // Check for URL
    ) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please fill in all required fields and ensure your ticket is uploaded.',
        position: 'bottom'
      });
      return;
    }

    if (isNaN(Number(weight)) || Number(weight) <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Weight',
        text2: 'Please enter a valid weight (e.g., 5).',
        position: 'bottom'
      });
      return;
    }

    if (travelDate > dropDate) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Dates',
        text2: 'Travel date cannot be after drop date.',
        position: 'bottom'
      });
      return;
    }

    // --- 2. Prepare Data for Confirmation Modal ---
    const startLocName = cities?.find(c => c.id === startLocation)?.place || 'N/A';
    const destLocName = cities?.find(c => c.id === destinationLocation)?.place || 'N/A';

    const details = {
      travelDate: travelDate.toDateString(),
      dropDate: dropDate.toDateString(),
      pickupTime: pickupTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dropTime: dropTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ticketFileName: ticketFile?.name || 'Ticket URL available', // Display name or just indicate URL
      weight: `${weight} kg`,
      startPincode: startPincode,
      startLocation: startLocName,
      pickupPoint: pickupPoint,
      destinationPincode: destinationPincode,
      destinationLocation: destLocName,
      dropPoint: dropPoint,
      ticketFileUrl: ticketFileUrl, // Display URL in confirmation for debugging/info
    };
    setTripDetailsToConfirm(details);
    setShowConfirmationModal(true);
  };

  const sendTripToBackend = async () => {
    setShowConfirmationModal(false);

    try {
      // --- MODIFIED: Send data as JSON, including the ticketFileUrl ---
      const tripData = {
        "travel_date": travelDate.toISOString().split('T')[0], // "2025-08-01"
        "start_point_id": startLocation, // 1
        "start_pin_code": startPincode, // "500001"
        "pickup_point": pickupPoint, // "Pickup Point A"
        // For pickup_time, you need to combine travelDate with pickupTime.
        // The backend expects ISO 8601 string with Z for UTC.
        "pickup_time": pickupTime.toISOString(),
        "end_point_id": destinationLocation, // 2
        "drop_date": dropDate.toISOString().split('T')[0], // "2025-08-02"
        "destination_pin_code": destinationPincode, // "600001"
        "drop_point": dropPoint, // "Drop Point B"
        // For drop_time, combine dropDate with dropTime.
        "drop_time": dropTime.toISOString(),
        "ticket_image_key": ticketFileUrl, // "https://example.com/ticket123.jpg"
        "weight_capacity": Number(weight), // 1000
        "status": "upcoming" // Assuming this is a static value for new trips
      };

      console.log('Sending Trip Data (JSON):', tripData);

      const response = await axios.post(
        ENDPOINTS.ADDTRIP, // Your main backend API endpoint for adding a trip
        tripData, // Send as JSON
        {
          headers: {
            'Content-Type': 'application/json', // IMPORTANT: Changed to application/json
            'Authorization': `Bearer ${user?.authToken}`,
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        
        clearTripDetails();
        navigation.navigate('AddTripSuccess'); // Navigate to success screen
       
      } else {
        Toast.show({
          type: 'error',
          text1: 'Submission Failed',
          text2: response.data?.message || 'Something went wrong.',
          position: 'bottom'
        });
        console.error('Backend response error:', response.data);
      }

    } catch (error) {
      console.error('Error submitting trip:', error);
      if (axios.isAxiosError(error)) {
        Toast.show({
          type: 'error',
          text1: 'Network Error',
          text2: error.response?.data?.message || error.message || 'Could not connect to server.',
          position: 'bottom'
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Submission Error',
          text2: 'An unexpected error occurred.',
          position: 'bottom'
        });
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar backgroundColor="white" barStyle="dark-content" />
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
          Add Your Trip
        </Text>
        <View style={{ width: 24, height: 24 }} />

      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          className="flex-1 bg-gray-50"
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >

          {/* Travel Information */}
          <View className="bg-white rounded-xl shadow-md p-5 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Travel Information</Text>

            <TouchableOpacity onPress={() => setShowDatePicker(true)} className={touchableInputStyle}>
              <FontAwesomeIcon icon={faCalendarAlt} color="#888" size={18} />
              <Text className="ml-3 text-gray-800 text-base flex-1">
                {travelDate.toDateString()}
              </Text>
            </TouchableOpacity>

            {
              showDatePicker && (
                <DatePicker
                  modal
                  mode="date"
                  open={showDatePicker}
                  date={travelDate}
                  minimumDate={new Date()}
                  onConfirm={(date) => {
                    setTravelDate(date);
                    setShowDatePicker(false);
                  }}
                  onCancel={() => setShowDatePicker(false)}
                />
              )
            }

            <TextInput
              className={inputStyle}
              keyboardType="numeric"
              maxLength={6}
              placeholder="Starting Pincode"
              placeholderTextColor="#999"
              value={startPincode}
              onChangeText={setStartPincode}
            />

            <TouchableOpacity onPress={() => setShowStartLocationPicker(true)} className={touchableInputStyle}>
              <FontAwesomeIcon icon={faMapMarkerAlt} color="#888" size={18} />
              <Text className="ml-3 text-gray-800 text-base flex-1">
                {startLocation != null && cities?.at(startLocation - 1)?.place.toString() || 'Starting Location'}
              </Text>
            </TouchableOpacity>

            <TextInput
              className={inputStyle}
              placeholder="Pickup Point"
              placeholderTextColor="#999"
              value={pickupPoint}
              onChangeText={setPickupPoint}
            />

            <TouchableOpacity onPress={() => { setShowPickupTimePicker(true) }} className={touchableInputStyle}>
              <FontAwesomeIcon icon={faClock} color="#888" size={18} />
              <Text className="ml-3 text-gray-800 text-base flex-1">
                {pickupTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
            {
              showPickupTimePicker && (
                <DatePicker
                  modal
                  mode="time"
                  open={showPickupTimePicker}
                  date={pickupTime}
                  onConfirm={(time) => {
                    setPickupTime(time);
                    setShowPickupTimePicker(false);
                  }}
                  onCancel={() => setShowPickupTimePicker(false)}
                />
              )
            }

          </View>

          {/* Destination Information */}
          <View className="bg-white rounded-xl shadow-md p-5 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Destination Information</Text>

            <TouchableOpacity onPress={() => { setShowDropDatePicker(true) }} className={touchableInputStyle}>
              <FontAwesomeIcon icon={faCalendarAlt} color="#888" size={18} />
              <Text className="ml-3 text-gray-800 text-base flex-1">
                {dropDate.toDateString()}
              </Text>
            </TouchableOpacity>

            {
              showDropDatePicker && (
                <DatePicker
                  modal
                  mode="date"
                  open={showDropDatePicker}
                  date={dropDate}
                  minimumDate={new Date()}
                  onConfirm={(date) => {
                    setDropDate(date);
                    setShowDropDatePicker(false);
                  }}
                  onCancel={() => setShowDropDatePicker(false)}
                />
              )
            }

            <TextInput
              className={inputStyle}
              keyboardType="numeric"
              maxLength={6}
              placeholder="Destination Pincode"
              placeholderTextColor="#999"
              value={destinationPincode}
              onChangeText={setDestinationPincode}
            />

            <TouchableOpacity onPress={() => setShowDestinationLocationPicker(true)} className={touchableInputStyle}>
              <FontAwesomeIcon icon={faMapMarkerAlt} color="#888" size={18} />
              <Text className="ml-3 text-gray-800 text-base flex-1">
                {destinationLocation != null && cities?.find(c => c.id === destinationLocation)?.place || 'Destination Location'}
              </Text>
            </TouchableOpacity>

            <TextInput
              className={inputStyle}
              placeholder="Drop Point"
              placeholderTextColor="#999"
              value={dropPoint}
              onChangeText={setDropPoint}
            />

            <TouchableOpacity
              onPress={() => setShowDropTimePicker(true)}
              className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50"
            >
              <FontAwesomeIcon icon={faClock} color="#888" size={18} />
              <Text className="ml-3 text-gray-800 text-base flex-1">
                {dropTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
            {
              showDropTimePicker && (
                <DatePicker
                  modal
                  mode="time"
                  open={showDropTimePicker}
                  date={dropTime}
                  onConfirm={(time) => {
                    setDropTime(time);
                    setShowDropTimePicker(false);
                  }}
                  onCancel={() => setShowDropTimePicker(false)}
                />
              )
            }
          </View>

          {/* Upload Ticket */}
          <View className="bg-white rounded-xl shadow-md p-5 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Upload Ticket</Text>
            <TouchableOpacity
              className="flex-row items-center justify-center border-2 border-dashed border-airbnb-primary-dark rounded-xl py-4 bg-red-50 mb-3"
              onPress={handleUpload}
              disabled={isUploading} // Disable button during upload
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#DA2824" />
              ) : (
                <FontAwesomeIcon icon={faUpload} color="#DA2824" size={24} />
              )}
              <Text className="ml-3 text-airbnb-primary-dark font-semibold text-base">
                {isUploading ? 'Uploading...' : (ticketFile ? 'Change Ticket' : 'Upload Ticket (PDF/DOCX)')}
              </Text>
            </TouchableOpacity>

            {/* Small Preview Box */}
            {ticketFile && ( // Still show this based on local file for name/type info
              <TouchableOpacity
                onPress={handlePreviewClick}
                className="flex-row items-center justify-between bg-gray-100 rounded-lg p-3 border border-gray-200 mb-3"
              >
                <View className="flex-row items-center flex-1">
                  <FontAwesomeIcon icon={faFileWord} color="#2563eb" size={20} />
                  <Text className="text-sm text-gray-700 ml-3 flex-1" numberOfLines={1} ellipsizeMode="middle">
                    {ticketFile.name || ticketFile.uri?.split('/').pop()}
                  </Text>
                </View>
                {ticketFileUrl && ( // Show checkmark if URL is received
                    <FontAwesomeIcon icon={faCheckCircle} color="#4CAF50" size={20} className="mr-2" />
                )}
                <TouchableOpacity onPress={clearTicketFile} className="p-1 ml-2">
                  <FontAwesomeIcon icon={faTimesCircle} color="#dc2626" size={18} />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
            <Text className="text-xs text-gray-500 mt-2 text-center">
              Supported formats: PDF, DOCX, DOC. Max file size: 5MB.
            </Text>
          </View>

          {/* Weight */}
          <View className="bg-white rounded-xl shadow-md p-5 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Weight Capacity (in kg)</Text>
            <TextInput
              className={inputStyle}
              keyboardType="numeric"
              placeholder="e.g. 5"
              placeholderTextColor="#999"
              value={weight}
              onChangeText={setWeight}
            />
            <Text className="text-sm text-gray-500 mt-2">
              This is the approximate weight you can comfortably carry.
            </Text>
          </View>

          <Text className="mt-4 text-gray-600 text-sm text-center px-4 mb-8">
            <Text>Note: Cancel your trip at least 5 hours in advance to avoid penalties.</Text>
          </Text>

          {/* Submit Button */}
          <TouchableOpacity
            className="bg-airbnb-primary py-4 rounded-xl items-center mx-4 shadow-lg"
            onPress={handleSubmit}
          >
            <Text className="text-white font-bold text-lg">Submit Trip</Text>
          </TouchableOpacity>
        </ScrollView>

      </KeyboardAvoidingView>
      {/* Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showConfirmationModal}
        onRequestClose={() => setShowConfirmationModal(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View className="bg-white rounded-xl p-6 w-[90%] shadow-lg">
            <Text className="text-xl font-bold text-gray-800 mb-4 text-center">Confirm Trip Details</Text>
            {tripDetailsToConfirm && (
              <ScrollView className="mb-5" style={{ maxHeight: screenHeight * 0.5 }}>
                {Object.entries(tripDetailsToConfirm).map(([key, value]) => {
                  let label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                  let icon = null;

                  switch (key) {
                    case 'travelDate':
                    case 'dropDate':
                      icon = faCalendarAlt;
                      break;
                    case 'pickupTime':
                    case 'dropTime':
                      icon = faClock;
                      break;
                    case 'ticketFileName':
                      icon = faTicketAlt;
                      break;
                    case 'weight':
                      icon = faWeightHanging;
                      break;
                    case 'startPincode':
                    case 'destinationPincode':
                      icon = faMapMarkerAlt;
                      break;
                    case 'startLocation':
                    case 'destinationLocation':
                      icon = faMapMarkerAlt;
                      break;
                    case 'pickupPoint':
                    case 'dropPoint':
                      icon = faRoad;
                      break;
                    default:
                      icon = null;
                  }

                  return (
                    <View key={key} className="flex-row items-center mb-3">
                      {icon && <FontAwesomeIcon icon={icon} size={16} color="#4A5568" />}
                      <Text className="text-gray-700 text-base font-semibold pl-4">
                        {label}:
                      </Text>
                      <Text className="text-gray-900 text-base ml-2 flex-1 font-bold">
                        {String(value)}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            )}
            <View className="flex-row justify-around mt-4">
              <TouchableOpacity
                className="bg-gray-200 py-3 px-6 rounded-lg"
                onPress={() => setShowConfirmationModal(false)}
              >
                <Text className="text-gray-800 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-airbnb-primary py-3 px-6 rounded-lg"
                onPress={sendTripToBackend}
              >
                <Text className="text-white font-semibold">Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Full Screen File Preview Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showFullPreviewModal}
        onRequestClose={() => setShowFullPreviewModal(false)}
      >
        <SafeAreaView className="flex-1 bg-gray-900">
          <View className="w-full flex-row justify-between items-center px-4 py-3 bg-gray-800 shadow-md">
            <Text className="text-white text-lg font-semibold flex-1 text-center">
              {ticketFile?.name || 'File Preview'}
            </Text>
            <TouchableOpacity onPress={() => setShowFullPreviewModal(false)} className="p-2">
              <FontAwesomeIcon icon={faTimes} size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View className="flex-1 items-center justify-center bg-gray-900">
            {previewFileUri && (
              <View className="p-8 items-center">
                <FontAwesomeIcon icon={faFileWord} size={80} color="#cbd5e1" />
                <Text className="text-white text-lg font-semibold mt-4 text-center">
                  Document preview not available in-app.
                </Text>
                <TouchableOpacity
                  onPress={handleOpenExternally}
                  className="bg-blue-600 px-6 py-3 rounded-lg mt-6"
                >
                  <Text className="text-white font-bold text-base">Open Externally</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      {/* City Picker Modals */}
      <CityPickerModal
        isVisible={showStartLocationPicker}
        onClose={() => setShowStartLocationPicker(false)}
        onSelectCity={handleSelectStartLocation}
        allCities={cities}
        currentCity={startLocation}
        excludedCity={destinationLocation}
      />
      <CityPickerModal
        isVisible={showDestinationLocationPicker}
        onClose={() => setShowDestinationLocationPicker(false)}
        onSelectCity={handleSelectDestinationLocation}
        allCities={cities}
        currentCity={destinationLocation}
        excludedCity={startLocation}
      />
      <Toast />
    </SafeAreaView >
  );
}