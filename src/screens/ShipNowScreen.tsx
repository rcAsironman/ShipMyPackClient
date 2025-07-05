import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
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
  Image,
  PermissionsAndroid,
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
  faVideo,
  faPlayCircle,
  faTimes,
  faMapMarkerAlt,
  faRoad,
  faWeightHanging,
  faBoxOpen,
  faSearch,
  faListAlt,
  faEnvelope,
  faUser,
  faPhone,
} from '@fortawesome/free-solid-svg-icons';
import {
  launchCamera,
  launchImageLibrary,
  MediaType,
  ImagePickerResponse,
} from 'react-native-image-picker';

// Ensure this path is correct for your project setup
import { cities } from '../data/cities';

const { height: screenHeight } = Dimensions.get('window');

interface VideoObject {
  uri: string;
  name?: string;
  type?: string;
  size?: number;
}

// --- CityPickerModal Component ---
interface CityPickerModalProps {
  isVisible: boolean; // Controls the Modal component's visibility
  onClose: () => void;
  onSelectCity: (city: string) => void;
  currentCity: string | null;
  excludedCity: string | null; // This can be null
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
  // ALL HOOKS MUST BE DECLARED UNCONDITIONALLY AT THE TOP LEVEL
  const [searchText, setSearchText] = useState<string>('');
  const [displayCities, setDisplayCities] = useState<string[]>(allCities);

  const pan = useRef(new Animated.Value(screenHeight)).current;
  const initialModalHeightRatio = 0.7;
  const initialModalHeight = screenHeight * initialModalHeightRatio;

  // This state controls the rendering of the *content inside* the Modal.
  // It allows the Animated.View to animate in/out before the content is truly unmounted.
  const [shouldRenderContent, setShouldRenderContent] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRenderContent(true); // Begin rendering internal content
      Animated.timing(pan, {
        toValue: screenHeight - initialModalHeight,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    } else {
      // Animate out, then set shouldRenderContent to false to stop rendering internal content
      Animated.timing(pan, {
        toValue: screenHeight,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start(() => {
        setShouldRenderContent(false); // Stop rendering content after animation finishes
        setSearchText(''); // Clear search when closed
      });
    }
  }, [isVisible, pan, initialModalHeight]);

  useEffect(() => {
    let results = allCities;

    if (searchText) {
      const lowerCaseSearch = searchText.toLowerCase();
      results = results.filter(city => city.toLowerCase().includes(lowerCaseSearch));
    }

    // --- SAFELY HANDLE excludedCity HERE ---
    if (excludedCity && typeof excludedCity === 'string') { // Check if it exists and is a string
      const lowerCaseExcludedCity = excludedCity.toLowerCase();
      results = results.filter(city => city.toLowerCase() !== lowerCaseExcludedCity);
    }
    // --- END SAFE HANDLING ---

    setDisplayCities(results);
  }, [searchText, excludedCity, allCities]);

  const handleCityPress = (city: string) => {
    onSelectCity(city);
    onClose(); // This will propagate the change to the parent's isVisible prop
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const newY = screenHeight - initialModalHeight + gestureState.dy;
        pan.setValue(Math.max(0, newY));
      },
      onPanResponderRelease: (evt, gestureState) => {
        const currentPanValue = pan._value;

        if (gestureState.dy > 100 || currentPanValue > screenHeight - initialModalHeight + 150) {
          onClose();
        } else if (gestureState.dy < -100 && currentPanValue < screenHeight / 2) {
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

  const CITY_ITEM_HEIGHT = 55;

  const getItemLayout = useCallback(
    (data: any, index: number) => ({
      length: CITY_ITEM_HEIGHT,
      offset: CITY_ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  return (
    // The Modal component's 'visible' prop directly uses 'isVisible' prop.
    // This ensures the Modal itself is consistently mounted/unmounted by React based on parent control.
    <Modal animationType="none" transparent={true} visible={isVisible} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
        {/* Only render the Animated.View and its children when shouldRenderContent is true.
            This ensures that the hooks *inside* CityPickerModal are always called
            when the modal is considered "visible" by React, and the actual content
            is only drawn when the animation is ready. */}
        {shouldRenderContent && (
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
              height: screenHeight - pan._value, // Dynamic height based on pan animation
              minHeight: initialModalHeight, // Ensure it doesn't shrink too much
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
                getItemLayout={getItemLayout}
              />
            </View>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
};

// --- CategoryPickerModal Component ---
interface CategoryPickerModalProps {
  isVisible: boolean; // Controls the Modal component's visibility
  onClose: () => void;
  onSelectCategory: (category: string) => void;
  currentCategory: string | null;
  categories: string[];
}

const CategoryPickerModal: React.FC<CategoryPickerModalProps> = ({
  isVisible,
  onClose,
  onSelectCategory,
  currentCategory,
  categories,
}) => {
  // ALL HOOKS MUST BE DECLARED UNCONDITIONALLY AT THE TOP LEVEL
  const pan = useRef(new Animated.Value(screenHeight)).current;
  const initialModalHeight = screenHeight * 0.7;

  // This state controls the rendering of the *content inside* the Modal.
  const [shouldRenderContent, setShouldRenderContent] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRenderContent(true);
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
      }).start(() => setShouldRenderContent(false));
    }
  }, [isVisible, pan, initialModalHeight]);

  const handleCategoryPress = (category: string) => {
    onSelectCategory(category);
    onClose();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const newY = screenHeight - initialModalHeight + gestureState.dy;
        pan.setValue(Math.max(0, newY));
      },
      onPanResponderRelease: (evt, gestureState) => {
        const currentPanValue = pan._value;

        if (gestureState.dy > 100 || currentPanValue > screenHeight - initialModalHeight + 150) {
          onClose();
        } else if (gestureState.dy < -100 && currentPanValue < screenHeight / 2) {
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

  const CATEGORY_ITEM_HEIGHT = 55;

  const getItemLayout = useCallback(
    (data: any, index: number) => ({
      length: CATEGORY_ITEM_HEIGHT,
      offset: CATEGORY_ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  return (
    // The Modal component's 'visible' prop directly uses 'isVisible' prop.
    <Modal animationType="none" transparent={true} visible={isVisible} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
        {/* Only render the Animated.View and its children when shouldRenderContent is true. */}
        {shouldRenderContent && (
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
              height: screenHeight - pan._value, // Dynamic height based on pan animation
              minHeight: initialModalHeight, // Ensure it doesn't shrink too much
            }}
            {...panResponder.panHandlers}
          >
            <View className="items-center py-2">
              <View className="w-16 h-1 bg-gray-300 rounded-full"></View>
            </View>

            <View className="flex-1 p-3">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold text-gray-800">Select Category</Text>
                <TouchableOpacity onPress={onClose} className="p-2">
                  <FontAwesomeIcon icon={faTimes} size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={categories}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleCategoryPress(item)}
                    className={`py-3 px-2 border-b border-gray-200 ${
                      item === currentCategory ? 'bg-blue-100' : ''
                    }`}
                  >
                    <Text
                      className={`text-lg ${
                        item === currentCategory ? 'font-semibold text-black' : 'text-gray-800'
                      }`}
                    >
                      {item}
                      {item === currentCategory && <Text className="text-sm text-gray-500 ml-2"> (Selected)</Text>}
                    </Text>
                  </TouchableOpacity>
                )}
                initialNumToRender={10}
                maxToRenderPerBatch={5}
                windowSize={11}
                style={{ flexGrow: 1 }}
                contentContainerStyle={{ paddingBottom: screenHeight * 0.4 }}
                getItemLayout={getItemLayout}
              />
            </View>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
};


// --- ShipNowScreen Component ---
export default function ShipNowScreen({ navigation }: { navigation: any }) {
  const [shippingDate, setShippingDate] = useState<Date>(new Date());
  const [deliveryDate, setDeliveryDate] = useState<Date>(new Date());
  const [pickupTime, setPickupTime] = useState<Date>(new Date());
  const [deliveryTime, setDeliveryTime] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [itemWeight, setItemWeight] = useState<string>('');
  const [senderPincode, setSenderPincode] = useState<string>('');
  const [senderLocation, setSenderLocation] = useState<string | null>(null);
  const [senderAddress, setSenderAddress] = useState<string>('');
  const [senderEmail, setSenderEmail] = useState<string>('');
  const [receiverName, setReceiverName] = useState<string>('');
  const [receiverContactNumber, setReceiverContactNumber] = useState<string>('');
  const [receiverPincode, setReceiverPincode] = useState<string>('');
  const [receiverLocation, setReceiverLocation] = useState<string | null>(null);
  const [receiverAddress, setReceiverAddress] = useState<string>('');
  const [shippingVideo, setShippingVideo] = useState<VideoObject | null>(null);

  // Modal visibility states - these control the 'visible' prop of the React Native Modal component
  const [showShippingDatePicker, setShowShippingDatePicker] = useState<boolean>(false);
  const [showDeliveryDatePicker, setShowDeliveryDatePicker] = useState<boolean>(false);
  const [showPickupTimePicker, setShowPickupTimePicker] = useState<boolean>(false);
  const [showDeliveryTimePicker, setShowDeliveryTimePicker] = useState<boolean>(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState<boolean>(false);

  const [showSenderLocationPicker, setShowSenderLocationPicker] = useState<boolean>(false);
  const [showReceiverLocationPicker, setShowReceiverLocationPicker] = useState<boolean>(false);

  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  const [shippingDetailsToConfirm, setShippingDetailsToConfirm] = useState<Record<string, string> | null>(null);

  const [showSuccessAnimation, setShowSuccessAnimation] = useState<boolean>(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;

  const inputStyle = 'border border-gray-300 px-4 py-3 rounded-xl bg-gray-50 text-gray-800 mb-4';
  const touchableInputStyle = 'flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 mb-4';

  const categoriesList = [
    'Electronics',
    'Documents',
    'Apparel/Clothing',
    'Food Items (Non-Perishable)',
    'Pickles & Preserves',
    'Fragile Items',
    'Books & Stationery',
    'Liquids (Sealed)',
    'Medical Supplies',
    'Home Decor',
    'Sporting Goods',
    'Other'
  ];

  const onDateChangeWrapper = (setter: React.Dispatch<React.SetStateAction<Date>>, showSetter: React.Dispatch<React.SetStateAction<boolean>>) =>
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      showSetter(false);
      if (selectedDate) setter(selectedDate);
    };

  const onShippingDateChange = onDateChangeWrapper(setShippingDate, setShowShippingDatePicker);
  const onDeliveryDateChange = onDateChangeWrapper(setDeliveryDate, setShowDeliveryDatePicker);
  const onPickupTimeChange = onDateChangeWrapper(setPickupTime, setShowPickupTimePicker);
  const onDeliveryTimeChange = onDateChangeWrapper(setDeliveryTime, setShowDeliveryTimePicker);

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setShowCategoryPicker(false);
  };

  const handleSelectSenderLocation = (city: string) => {
    setSenderLocation(city);
    setShowSenderLocationPicker(false); // Make sure this closes the sender location picker
  };

  const handleSelectReceiverLocation = (city: string) => {
    setReceiverLocation(city);
    setShowReceiverLocationPicker(false);
  };

  const handleVideoUpload = async (source: 'camera' | 'library') => {
    try {
      const options = {
        mediaType: 'video' as MediaType,
        quality: 0.8,
        videoQuality: 'high' as 'low' | 'medium' | 'high',
        durationLimit: 60,
        saveToPhotos: true,
      };

      let response: ImagePickerResponse;
      if (source === 'camera') {
        response = await launchCamera(options);
      } else {
        response = await launchImageLibrary(options);
      }

      if (response.didCancel) {
        console.log('User cancelled video picker');
      } else if (response.errorMessage) {
        Alert.alert('Video Error', response.errorMessage);
        console.error('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const videoAsset = response.assets[0];
        if (videoAsset.uri) {
          console.log('Picked video:', videoAsset);
          setShippingVideo({
            uri: videoAsset.uri,
            name: videoAsset.fileName || videoAsset.uri.split('/').pop(),
            type: videoAsset.type,
            size: videoAsset.fileSize,
          });
          Alert.alert('Video Uploaded', `Uploaded: ${videoAsset.fileName ?? 'Video'}`);
        }
      }
    } catch (err) {
      console.error('Video Upload Error:', err);
      Alert.alert('Upload Failed', 'There was an error uploading your video.');
    }
  };

  const clearShippingVideo = () => {
    setShippingVideo(null);
    Alert.alert('Video Removed', 'Uploaded video has been removed.');
  };

  const clearShippingDetails = () => {
    setShippingDate(new Date());
    setDeliveryDate(new Date());
    setPickupTime(new Date());
    setDeliveryTime(new Date());
    setSelectedCategory(null);
    setItemWeight('');
    setSenderPincode('');
    setSenderLocation(null);
    setSenderAddress('');
    setSenderEmail('');
    setReceiverName('');
    setReceiverContactNumber('');
    setReceiverPincode('');
    setReceiverLocation(null);
    setReceiverAddress('');
    setShippingVideo(null);
  };

  const handleSubmit = () => {
    if (
      !shippingDate ||
      !deliveryDate ||
      !pickupTime ||
      !deliveryTime ||
      !selectedCategory ||
      !itemWeight ||
      !shippingVideo ||
      !senderPincode ||
      !senderLocation ||
      !senderAddress ||
      !receiverName ||
      !receiverContactNumber ||
      !receiverPincode ||
      !receiverLocation ||
      !receiverAddress
    ) {
      Alert.alert('Missing Information', 'Please fill in all required fields and upload a video of your item.');
      return;
    }

    setShippingDetailsToConfirm({
      shippingDate: shippingDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
      deliveryDate: deliveryDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
      pickupTime: pickupTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      deliveryTime: deliveryTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      category: selectedCategory,
      itemWeight: `${itemWeight} kg`,
      shippingVideoName: shippingVideo?.name || 'N/A',
      senderPincode,
      senderLocation,
      senderAddress,
      senderEmail: senderEmail || 'N/A (Optional)',
      receiverName,
      receiverContactNumber,
      receiverPincode,
      receiverLocation,
      receiverAddress,
    });

    setShowConfirmationModal(true);
  };

  const confirmSubmission = () => {
    setShowConfirmationModal(false);

    Keyboard.dismiss();

    console.log('Shipping Confirmed and Submitted:', shippingDetailsToConfirm);

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
          clearShippingDetails();
          Alert.alert('Success!', 'Your shipping request has been submitted!');
        });
      }, 1500);
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar backgroundColor="white" barStyle="dark-content" />

      {/* FIXED HEADER */}
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
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <FontAwesomeIcon icon={faArrowLeft} size={24} color="#333" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '700', color: 'black', flex: 1, textAlign: 'center' }}>
          Shipping Information
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
          {/* Item Information */}
          <View className="bg-white rounded-xl shadow-md p-5 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Item Details</Text>

            {/* Category Selection */}
            <TouchableOpacity onPress={() => setShowCategoryPicker(true)} className={touchableInputStyle}>
              <FontAwesomeIcon icon={faListAlt} color="#888" size={18} />
              <Text className="ml-3 text-gray-800 text-base flex-1">
                {selectedCategory || 'Select Item Category'}
              </Text>
            </TouchableOpacity>

            <TextInput
              className={inputStyle}
              keyboardType="numeric"
              placeholder="Approximate Weight (in kg)"
              placeholderTextColor="#999"
              value={itemWeight}
              onChangeText={setItemWeight}
            />
            <Text className="text-sm text-gray-500 mt-2 mb-4">
              This is the approximate weight of the item you want to ship.
            </Text>

            <Text className="text-lg font-semibold text-gray-800 mb-4">Upload Item Video</Text>
            <View className="flex-row justify-around mb-3">
              <TouchableOpacity
                className="flex-1 items-center justify-center border-2 border-dashed border-airbnb-primary-dark rounded-xl py-4 bg-red-50 mr-2"
                onPress={() => handleVideoUpload('camera')}
              >
                <FontAwesomeIcon icon={faVideo} color="#DA2824" size={24} />
                <Text className="text-airbnb-primary-dark font-semibold text-base mt-2">Record Live Video</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 items-center justify-center border-2 border-dashed border-airbnb-primary-dark rounded-xl py-4 bg-red-50 ml-2"
                onPress={() => handleVideoUpload('library')}
              >
                <FontAwesomeIcon icon={faUpload} color="#DA2824" size={24} />
                <Text className="text-airbnb-primary-dark font-semibold text-base mt-2">Upload from Gallery</Text>
              </TouchableOpacity>
            </View>

            {/* Video Preview Box */}
            {shippingVideo && (
              <View
                className="flex-row items-center justify-between bg-gray-100 rounded-lg p-3 border border-gray-200 mt-3"
              >
                <View className="flex-row items-center flex-1">
                  <FontAwesomeIcon icon={faPlayCircle} color="#2563eb" size={20} />
                  <Text className="text-sm text-gray-700 ml-3 flex-1" numberOfLines={1} ellipsizeMode="middle">
                    {shippingVideo.name || shippingVideo.uri?.split('/').pop()}
                  </Text>
                </View>
                <TouchableOpacity onPress={clearShippingVideo} className="p-1 ml-2">
                  <FontAwesomeIcon icon={faTimesCircle} color="#dc2626" size={18} />
                </TouchableOpacity>
              </View>
            )}

            <Text className="text-xs text-gray-500 mt-2 text-center">
              Record a short video (max 60s) of the item for security and verification.
            </Text>
          </View>

          {/* Sender Information */}
          <View className="bg-white rounded-xl shadow-md p-5 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Sender Information</Text>

            <TouchableOpacity onPress={() => setShowShippingDatePicker(true)} className={touchableInputStyle}>
              <FontAwesomeIcon icon={faCalendarAlt} color="#888" size={18} />
              <Text className="ml-3 text-gray-800 text-base flex-1">
                Ship Date: {shippingDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </Text>
            </TouchableOpacity>
            {showShippingDatePicker && (
              <Modal
                transparent={true}
                animationType="fade"
                visible={showShippingDatePicker}
                onRequestClose={() => setShowShippingDatePicker(false)}
              >
                <TouchableOpacity
                  style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}
                  activeOpacity={1}
                  onPressOut={() => setShowShippingDatePicker(false)}
                >
                  <View style={Platform.OS === 'ios' ? { height: 280, backgroundColor: 'white', borderRadius: 10, overflow: 'hidden' } : {}}>
                    <DateTimePicker
                      value={shippingDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'inline' : 'default'}
                      minimumDate={new Date()}
                      onChange={onShippingDateChange}
                    />
                  </View>
                </TouchableOpacity>
              </Modal>
            )}

            <TextInput
              className={inputStyle}
              keyboardType="numeric"
              maxLength={6}
              placeholder="Sender Pincode"
              placeholderTextColor="#999"
              value={senderPincode}
              onChangeText={setSenderPincode}
            />

            {/* Sender Location TouchableOpacity */}
            <TouchableOpacity onPress={() => setShowSenderLocationPicker(true)} className={touchableInputStyle}>
              <FontAwesomeIcon icon={faMapMarkerAlt} color="#888" size={18} />
              <Text className="ml-3 text-gray-800 text-base flex-1">
                {senderLocation || 'Sender Location (City)'}
              </Text>
            </TouchableOpacity>

            <TextInput
              className={`${inputStyle} h-24`}
              placeholder="Sender Full Address"
              placeholderTextColor="#999"
              value={senderAddress}
              onChangeText={setSenderAddress}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Sender Email (Optional) */}
            <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 mb-4">
              <FontAwesomeIcon icon={faEnvelope} color="#888" size={18} />
              <TextInput
                className="ml-3 flex-1 text-gray-800 text-base"
                keyboardType="email-address"
                placeholder="Sender Email (Optional)"
                placeholderTextColor="#999"
                value={senderEmail}
                onChangeText={setSenderEmail}
                autoCapitalize="none"
              />
            </View>


            <TouchableOpacity onPress={() => setShowPickupTimePicker(true)} className={touchableInputStyle}>
              <FontAwesomeIcon icon={faClock} color="#888" size={18} />
              <Text className="ml-3 text-gray-800 text-base flex-1">
                Pickup Time: {pickupTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </Text>
            </TouchableOpacity>
            {showPickupTimePicker && (
              <Modal
                transparent={true}
                animationType="fade"
                visible={showPickupTimePicker}
                onRequestClose={() => setShowPickupTimePicker(false)}
              >
                <TouchableOpacity
                  style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}
                  activeOpacity={1}
                  onPressOut={() => setShowPickupTimePicker(false)}
                >
                  <View style={Platform.OS === 'ios' ? { height: 180, backgroundColor: 'white', borderRadius: 10, overflow: 'hidden' } : {}}>
                    <DateTimePicker
                      value={pickupTime}
                      mode="time"
                      display={Platform.OS === 'ios' ? 'inline' : 'default'}
                      onChange={onPickupTimeChange}
                    />
                  </View>
                </TouchableOpacity>
              </Modal>
            )}
          </View>

          {/* Receiver Information */}
          <View className="bg-white rounded-xl shadow-md p-5 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Receiver Information</Text>

            {/* Receiver Name */}
            <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 mb-4">
              <FontAwesomeIcon icon={faUser} color="#888" size={18} />
              <TextInput
                className="ml-3 flex-1 text-gray-800 text-base"
                placeholder="Receiver Full Name"
                placeholderTextColor="#999"
                value={receiverName}
                onChangeText={setReceiverName}
              />
            </View>

            {/* Receiver Contact Number - Manual Entry Only */}
            <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 mb-4">
              <FontAwesomeIcon icon={faPhone} color="#888" size={18} />
              <TextInput
                className="ml-3 flex-1 text-gray-800 text-base"
                keyboardType="phone-pad"
                placeholder="Receiver Contact Number"
                placeholderTextColor="#999"
                value={receiverContactNumber}
                onChangeText={text => setReceiverContactNumber(text.replace(/[^0-9+]/g, ''))} // Allow only numbers and plus sign
              />
            </View>


            <TouchableOpacity onPress={() => setShowDeliveryDatePicker(true)} className={touchableInputStyle}>
              <FontAwesomeIcon icon={faCalendarAlt} color="#888" size={18} />
              <Text className="ml-3 text-gray-800 text-base flex-1">
                Delivery Date: {deliveryDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </Text>
            </TouchableOpacity>
            {showDeliveryDatePicker && (
              <Modal
                transparent={true}
                animationType="fade"
                visible={showDeliveryDatePicker}
                onRequestClose={() => setShowDeliveryDatePicker(false)}
              >
                <TouchableOpacity
                  style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}
                  activeOpacity={1}
                  onPressOut={() => setShowDeliveryDatePicker(false)}
                >
                  <View style={Platform.OS === 'ios' ? { height: 280, backgroundColor: 'white', borderRadius: 10, overflow: 'hidden' } : {}}>
                    <DateTimePicker
                      value={deliveryDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'inline' : 'default'}
                      minimumDate={shippingDate}
                      onChange={onDeliveryDateChange}
                    />
                  </View>
                </TouchableOpacity>
              </Modal>
            )}

            <TextInput
              className={inputStyle}
              keyboardType="numeric"
              maxLength={6}
              placeholder="Receiver Pincode"
              placeholderTextColor="#999"
              value={receiverPincode}
              onChangeText={setReceiverPincode}
            />

            <TouchableOpacity onPress={() => setShowReceiverLocationPicker(true)} className={touchableInputStyle}>
              <FontAwesomeIcon icon={faMapMarkerAlt} color="#888" size={18} />
              <Text className="ml-3 text-gray-800 text-base flex-1">
                {receiverLocation || 'Receiver Location (City)'}
              </Text>
            </TouchableOpacity>

            <TextInput
              className={`${inputStyle} h-24`}
              placeholder="Receiver Full Address"
              placeholderTextColor="#999"
              value={receiverAddress}
              onChangeText={setReceiverAddress}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity
              onPress={() => setShowDeliveryTimePicker(true)}
              className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50"
            >
              <FontAwesomeIcon icon={faClock} color="#888" size={18} />
              <Text className="ml-3 text-gray-800 text-base flex-1">
                Delivery Time: {deliveryTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </Text>
            </TouchableOpacity>
            {showDeliveryTimePicker && (
              <Modal
                transparent={true}
                animationType="fade"
                visible={showDeliveryTimePicker}
                onRequestClose={() => setShowDeliveryTimePicker(false)}
              >
                <TouchableOpacity
                  style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}
                  activeOpacity={1}
                  onPressOut={() => setShowDeliveryTimePicker(false)}
                >
                  <View style={Platform.OS === 'ios' ? { height: 180, backgroundColor: 'white', borderRadius: 10, overflow: 'hidden' } : {}}>
                    <DateTimePicker
                      value={deliveryTime}
                      mode="time"
                      display={Platform.OS === 'ios' ? 'inline' : 'default'}
                      onChange={onDeliveryTimeChange}
                    />
                  </View>
                </TouchableOpacity>
              </Modal>
            )}
          </View>

          <Text className="mt-4 text-gray-600 text-sm text-center px-4 mb-8">
            <Text>Note: Ensure all details are accurate to avoid shipping delays.</Text>
          </Text>

          {/* Submit Button */}
          <TouchableOpacity
            className="bg-airbnb-primary py-4 rounded-xl items-center mx-4 shadow-lg"
            onPress={handleSubmit}
          >
            <Text className="text-white font-bold text-lg">Submit Shipping Request</Text>
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
            <Text className="text-xl font-bold text-gray-800 mb-4 text-center">Confirm Shipping Details</Text>
            {shippingDetailsToConfirm && (
              <ScrollView className="mb-5" style={{ maxHeight: screenHeight * 0.5 }}>
                {Object.entries(shippingDetailsToConfirm).map(([key, value]) => {
                  let label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                  let icon = null;

                  switch (key) {
                    case 'shippingDate':
                    case 'deliveryDate':
                      icon = faCalendarAlt;
                      break;
                    case 'pickupTime':
                    case 'deliveryTime':
                      icon = faClock;
                      break;
                    case 'category':
                      icon = faListAlt;
                      break;
                    case 'itemWeight':
                      icon = faWeightHanging;
                      break;
                    case 'shippingVideoName':
                      icon = faVideo;
                      break;
                    case 'senderPincode':
                    case 'receiverPincode':
                      icon = faMapMarkerAlt;
                      break;
                    case 'senderLocation':
                    case 'receiverLocation':
                      icon = faMapMarkerAlt;
                      break;
                    case 'senderAddress':
                    case 'receiverAddress':
                      icon = faRoad;
                      break;
                    case 'senderEmail':
                      icon = faEnvelope;
                      break;
                    case 'receiverName':
                      icon = faUser;
                      break;
                    case 'receiverContactNumber':
                      icon = faPhone;
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

      {/* City Picker Modals - Controlled by their respective state variables in ShipNowScreen */}
      <CityPickerModal
        isVisible={showSenderLocationPicker}
        onClose={() => setShowSenderLocationPicker(false)}
        onSelectCity={handleSelectSenderLocation}
        allCities={cities}
        currentCity={senderLocation}
        excludedCity={receiverLocation}
      />
      <CityPickerModal
        isVisible={showReceiverLocationPicker}
        onClose={() => setShowReceiverLocationPicker(false)}
        onSelectCity={handleSelectReceiverLocation}
        allCities={cities}
        currentCity={receiverLocation}
        excludedCity={senderLocation}
      />

      {/* Category Picker Modal - Controlled by its respective state variable in ShipNowScreen */}
      <CategoryPickerModal
        isVisible={showCategoryPicker}
        onClose={() => setShowCategoryPicker(false)}
        onSelectCategory={handleSelectCategory}
        currentCategory={selectedCategory}
        categories={categoriesList}
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
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: fadeAnim,
          }}
        >
          <Animated.View
            style={{
              transform: [{ scale: scaleAnim }],
              backgroundColor: 'white',
              borderRadius: 20,
              padding: 30,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FontAwesomeIcon icon={faCheckCircle} size={80} color="#28a745" />
            <Text className="text-2xl font-bold text-gray-800 mt-4">Success!</Text>
            <Text className="text-md text-gray-600 mt-2">Shipping request sent!</Text>
          </Animated.View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}