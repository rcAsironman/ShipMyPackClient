import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text, // Ensure Text is imported
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
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
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

import { cities } from '../data/cities'; // Import the cities list

const { height: screenHeight } = Dimensions.get('window');

// Define a type for the ticket file object
interface FileObject {
  uri: string;
  name?: string;
  type?: string;
  size?: number;
}

// --- CityPickerModal Component ---
interface CityPickerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectCity: (city: string) => void;
  currentCity: string | null;
  excludedCity: string | null;
  allCities: string[];
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
  const [displayCities, setDisplayCities] = useState<string[]>(allCities);

  // Animated value for modal position
  const pan = useRef(new Animated.Value(screenHeight)).current;
  const initialModalHeight = screenHeight * 0.7; // Initial height for the modal (bottom sheet)
  const fullModalHeight = screenHeight; // Full height for the modal when expanded

  const [currentModalVisible, setCurrentModalVisible] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setCurrentModalVisible(true);
      Animated.timing(pan, {
        toValue: screenHeight - initialModalHeight, // Start from the initial height
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(pan, {
        toValue: screenHeight, // Animate out to full screen height (off-screen)
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start(() => setCurrentModalVisible(false));
    }
  }, [isVisible, pan, initialModalHeight]);

  useEffect(() => {
    let results = allCities;

    // 1. Filter by search text
    if (searchText) {
      const lowerCaseSearch = searchText.toLowerCase();
      results = results.filter(city => city.toLowerCase().includes(lowerCaseSearch));
    }

    // 2. Filter out the excluded city
    if (excludedCity) {
      const lowerCaseExcludedCity = excludedCity.toLowerCase();
      results = results.filter(city => city.toLowerCase() !== lowerCaseExcludedCity);
    }

    setDisplayCities(results);
  }, [searchText, excludedCity, allCities]);

  const handleCityPress = (city: string) => {
    onSelectCity(city);
    setSearchText('');
    onClose(); // Close modal after selection
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        // Allow dragging upwards (to expand) or downwards (to close)
        // Ensure the modal doesn't go above the top of the screen (y=0)
        pan.setValue(Math.max(0, screenHeight - initialModalHeight + gestureState.dy));
      },
      onPanResponderRelease: (evt, gestureState) => {
        // If dragged down significantly (more than 100 pixels), close the modal
        if (gestureState.dy > 100) {
          onClose();
        }
        // If dragged up significantly (past a certain threshold), expand to full height
        else if (gestureState.dy < -100 && pan._value < screenHeight / 2) {
          Animated.spring(pan, {
            toValue: 0, // Snap to full screen
            speed: 10,
            bounciness: 5,
            useNativeDriver: true,
          }).start();
        }
        // Otherwise, snap back to the initial bottom sheet height
        else {
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

  // Render the modal only when it's supposed to be visible or animating out
  if (!isVisible && !currentModalVisible) return null;

  return (
    <Modal animationType="none" transparent={true} visible={isVisible || currentModalVisible} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <Animated.View
          style={{
            transform: [{ translateY: pan }],
            backgroundColor: 'white',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 5,
            paddingBottom: Platform.OS === 'ios' ? 30 : 5, // Add padding for iOS safe area
            position: 'absolute',
            left: 0,
            right: 0,
            height: fullModalHeight, // Allow full height to enable full-page view
          }}
          {...panResponder.panHandlers} // Attach pan handlers here
        >
          {/* Draggable indicator */}
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
              {/* Clear Button for Input */}
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText('')} className="p-1 ml-2">
                  <FontAwesomeIcon icon={faTimesCircle} size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={displayCities}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleCityPress(item)}
                  className={`py-3 px-2 border-b border-gray-200 ${
                    item === currentCity ? 'bg-blue-100' : ''
                  }`}
                >
                  <Text
                    className={`text-lg ${
                      item === currentCity ? 'font-semibold text-black' : 'text-gray-800'
                    }`}
                  >
                    {item}
                    {item === currentCity && <Text className="text-sm text-gray-500 ml-2"> (Already Selected)</Text>}
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
      </View>
    </Modal>
  );
};
// --- End CityPickerModal Component ---

export default function AddTripScreen({ navigation }: { navigation: any }) {
  const [travelDate, setTravelDate] = useState<Date>(new Date());
  const [dropDate, setDropDate] = useState<Date>(new Date());
  const [pickupTime, setPickupTime] = useState<Date>(new Date());
  const [dropTime, setDropTime] = useState<Date>(new Date());
  const [ticketFile, setTicketFile] = useState<FileObject | null>(null);
  const [weight, setWeight] = useState<string>('');
  const [startPincode, setStartPincode] = useState<string>('');
  const [startLocation, setStartLocation] = useState<string | null>(null);
  const [pickupPoint, setPickupPoint] = useState<string>('');
  const [destinationPincode, setDestinationPincode] = useState<string>('');
  const [destinationLocation, setDestinationLocation] = useState<string | null>(null);
  const [dropPoint, setDropPoint] = useState<string>('');

  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showDropDatePicker, setShowDropDatePicker] = useState<boolean>(false);
  const [showPickupTimePicker, setShowPickupTimePicker] = useState<boolean>(false);
  const [showDropTimePicker, setShowDropTimePicker] = useState<boolean>(false);

  const [showStartLocationPicker, setShowStartLocationPicker] = useState<boolean>(false);
  const [showDestinationLocationPicker, setShowDestinationLocationPicker] = useState<boolean>(false);

  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  const [tripDetailsToConfirm, setTripDetailsToConfirm] = useState<Record<string, string> | null>(null);

  const [showSuccessAnimation, setShowSuccessAnimation] = useState<boolean>(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;

  const [showFullPreviewModal, setShowFullPreviewModal] = useState<boolean>(false);
  const [previewFileUri, setPreviewFileUri] = useState<string | null>(null);

  const inputStyle = 'border border-gray-300 px-4 py-3 rounded-xl bg-gray-50 text-gray-800 mb-4';
  const touchableInputStyle = 'flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 mb-4';

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setTravelDate(selectedDate);
  };

  const onDropDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDropDatePicker(false);
    if (selectedDate) setDropDate(selectedDate);
  };

  const onPickupTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowPickupTimePicker(false);
    if (selectedTime) setPickupTime(selectedTime);
  };

  const onDropTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowDropTimePicker(false);
    if (selectedTime) setDropTime(selectedTime);
  };

  const handleSelectStartLocation = (city: string) => {
    setStartLocation(city);
    setShowStartLocationPicker(false);
  };

  const handleSelectDestinationLocation = (city: string) => {
    setDestinationLocation(city);
    setShowDestinationLocationPicker(false);
  };

  const handleUpload = async () => {
    try {
      const [file]: DocumentPickerResponse[] = await pick({
        types: [types.pdf, types.doc, types.docx],
      });

      if (file) {
        console.log('Picked file:', file);
        setTicketFile({
          uri: file.uri,
          name: file.name || file.uri.split('/').pop(),
          type: file.type,
          size: file.size,
        });
        Alert.alert('File Uploaded', `Uploaded: ${file.name ?? file.uri.split('/').pop()}`);
      }
    } catch (err) {
      if (isCancel(err)) {
        console.log('User cancelled document picker');
      } else {
        const errorMessage = `Error: ${(err as Error).message || 'Unknown error'}. Code: ${(err as any).code || 'N/A'}.`;
        console.error('Document Picker Error:', err);
        Alert.alert('Upload Failed', `There was an error uploading your file.\n${errorMessage}`);
      }
    }
  };

  const clearTicketFile = () => {
    setTicketFile(null);
    setPreviewFileUri(null);
    Alert.alert('File Removed', 'Uploaded ticket has been removed.');
  };

  const handlePreviewClick = () => {
    if (ticketFile?.uri) {
      setPreviewFileUri(ticketFile.uri);
      setShowFullPreviewModal(true);
    }
  };

  const handleOpenExternally = async () => {
    if (previewFileUri) {
      try {
        await Linking.openURL(previewFileUri);
      } catch (error) {
        Alert.alert('Cannot Open File', 'No app found to open this file type, or an error occurred.');
        console.error('Error opening file externally:', error);
      }
    }
  };

  const clearTripDetails = () => {
    setTravelDate(new Date());
    setDropDate(new Date());
    setPickupTime(new Date());
    setDropTime(new Date());
    setTicketFile(null);
    setWeight('');
    setStartPincode('');
    setStartLocation(null);
    setPickupPoint('');
    setDestinationPincode('');
    setDestinationLocation(null);
    setDropPoint('');
    setPreviewFileUri(null);
  };

  const handleSubmit = () => {
    if (
      !travelDate ||
      !dropDate ||
      !pickupTime ||
      !dropTime ||
      !weight ||
      !ticketFile ||
      !startPincode ||
      !startLocation ||
      !destinationPincode ||
      !destinationLocation
    ) {
      Alert.alert('Missing Information', 'Please fill in all required fields and upload your ticket.');
      return;
    }

    setTripDetailsToConfirm({
      travelDate: travelDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
      dropDate: dropDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
      pickupTime: pickupTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      dropTime: dropTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      ticketFileName: ticketFile?.name || 'N/A',
      weight: `${weight} kg`,
      startPincode,
      startLocation,
      pickupPoint: pickupPoint || 'N/A',
      destinationPincode,
      destinationLocation,
      dropPoint: dropPoint || 'N/A',
    });

    setShowConfirmationModal(true);
  };

  const confirmSubmission = () => {
    setShowConfirmationModal(false);

    Keyboard.dismiss();

    console.log('Trip Confirmed and Submitted:', tripDetailsToConfirm);

    setShowSuccessAnimation(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.7,
            duration: 500,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setShowSuccessAnimation(false);
          clearTripDetails();
          Alert.alert('Success!', 'Your trip has been added. Ready for a new one!');
        });
      }, 1500);
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar backgroundColor="white" barStyle="dark-content" />

      {/* FIXED HEADER - Styled to match HomeScreen header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: Platform.OS === 'android' ? (StatusBar?.currentHeight || 0) + 20 : screenHeight * 0.05,
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
        <TouchableOpacity onPress={() => navigation?.goBack?.()} style={{ padding: 5 }}>
          <FontAwesomeIcon icon={faArrowLeft} size={24} color="black" />
        </TouchableOpacity>

        <Text style={{ fontSize: 20, fontWeight: '700', color: 'black', flex: 1, textAlign: 'center' }}>
          Add Your Trip
        </Text>

        <View style={{ width: 24, height: 24 }} />
      </View>

      {/* Scrollable Content Container: KeyboardAvoidingView wraps ScrollView */}
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
                {travelDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <View style={Platform.OS === 'ios' ? { height: 280 } : null}>
                <DateTimePicker
                  value={travelDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  minimumDate={new Date()}
                  onChange={onDateChange}
                />
              </View>
            )}

            <TextInput
              className={inputStyle}
              keyboardType="numeric"
              maxLength={6}
              placeholder="Starting Pincode"
              placeholderTextColor="#999"
              value={startPincode}
              onChangeText={setStartPincode}
            />

            {/* Starting Location Picker */}
            <TouchableOpacity onPress={() => setShowStartLocationPicker(true)} className={touchableInputStyle}>
              <FontAwesomeIcon icon={faMapMarkerAlt} color="#888" size={18} />
              <Text className="ml-3 text-gray-800 text-base flex-1">
                {startLocation || 'Starting Location'}
              </Text>
            </TouchableOpacity>

            <TextInput
              className={inputStyle}
              placeholder="Pickup Point (Optional)"
              placeholderTextColor="#999"
              value={pickupPoint}
              onChangeText={setPickupPoint}
            />

            <TouchableOpacity onPress={() => setShowPickupTimePicker(true)} className={touchableInputStyle}>
              <FontAwesomeIcon icon={faClock} color="#888" size={18} />
              <Text className="ml-3 text-gray-800 text-base flex-1">
                {pickupTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </Text>
            </TouchableOpacity>
            {showPickupTimePicker && (
              <View style={Platform.OS === 'ios' ? { height: 180 } : null}>
                <DateTimePicker
                  value={pickupTime}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  onChange={onPickupTimeChange}
                />
              </View>
            )}
          </View>

          {/* Destination Information */}
          <View className="bg-white rounded-xl shadow-md p-5 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Destination Information</Text>

            <TouchableOpacity onPress={() => setShowDropDatePicker(true)} className={touchableInputStyle}>
              <FontAwesomeIcon icon={faCalendarAlt} color="#888" size={18} />
              <Text className="ml-3 text-gray-800 text-base flex-1">
                {dropDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </Text>
            </TouchableOpacity>
            {showDropDatePicker && (
              <View style={Platform.OS === 'ios' ? { height: 280 } : null}>
                <DateTimePicker
                  value={dropDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  minimumDate={travelDate}
                  onChange={onDropDateChange}
                />
              </View>
            )}

            <TextInput
              className={inputStyle}
              keyboardType="numeric"
              maxLength={6}
              placeholder="Destination Pincode"
              placeholderTextColor="#999"
              value={destinationPincode}
              onChangeText={setDestinationPincode}
            />

            {/* Destination Location Picker */}
            <TouchableOpacity onPress={() => setShowDestinationLocationPicker(true)} className={touchableInputStyle}>
              <FontAwesomeIcon icon={faMapMarkerAlt} color="#888" size={18} />
              <Text className="ml-3 text-gray-800 text-base flex-1">
                {destinationLocation || 'Destination Location'}
              </Text>
            </TouchableOpacity>

            <TextInput
              className={inputStyle}
              placeholder="Drop Point (Optional)"
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
                {dropTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </Text>
            </TouchableOpacity>
            {showDropTimePicker && (
              <View style={Platform.OS === 'ios' ? { height: 180 } : null}>
                <DateTimePicker
                  value={dropTime}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  onChange={onDropTimeChange}
                />
              </View>
            )}
          </View>

          {/* Upload Ticket */}
          <View className="bg-white rounded-xl shadow-md p-5 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Upload Ticket</Text>
            <TouchableOpacity
              className="flex-row items-center justify-center border-2 border-dashed border-airbnb-primary-dark rounded-xl py-4 bg-red-50 mb-3"
              onPress={handleUpload}
            >
              <FontAwesomeIcon icon={faUpload} color="#DA2824" size={24} />
              <Text className="ml-3 text-airbnb-primary-dark font-semibold text-base">
                {ticketFile ? 'Change Ticket' : 'Upload Ticket (PDF/DOCX)'}
              </Text>
            </TouchableOpacity>

            {/* Small Preview Box */}
            {ticketFile && (
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
            <Text className="text-lg font-semibold text-gray-800 mb-4">Weight Capacity</Text>
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

                  // Assign icons based on key
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
                      {icon && <FontAwesomeIcon icon={icon} size={16} color="#4A5568"/>} {/* Added mr-3 here */}
                      <Text className="text-gray-700 text-base font-semibold pl-4">
                        {label}:
                      </Text>
                      <Text className="text-gray-900 text-base ml-2 flex-1 font-bold">
                        {value}
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
                onPress={confirmSubmission}
              >
                <Text className="text-white font-semibold">Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Full Screen File Preview Modal (now generic for all docs) */}
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

      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: fadeAnim,
            zIndex: 100,
          }}
        >
          <Animated.View
            style={{
              transform: [{ scale: scaleAnim }],
              backgroundColor: 'white',
              padding: 40,
              borderRadius: 100,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 15,
            }}
          >
            <FontAwesomeIcon icon={faCheckCircle} size={80} color="#4CAF50" />
            <Text className="text-xl font-bold text-gray-800 mt-4">Trip Added!</Text>
          </Animated.View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}