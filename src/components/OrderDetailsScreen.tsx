import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { BlurView } from '@react-native-community/blur';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faArrowLeft,
  faUserEdit,
  faMapMarkedAlt,
  faComments,
  faPhone,
  faStar,
  faBoxOpen,
  faTimesCircle,
  faShieldAlt,
  faTruck,
  faClock, faCheckCircle, faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { Picker } from '@react-native-picker/picker';
import ImageCarousel from '../components/ImageCarousel'; // Assuming ImageCarousel is in the same directory
import OrderDetailsCarousel from './OrderDetailsCarousel';
import CustomAlertModal from './CustomAlertModal';
import { SpinningIcon } from './SpinningIcon';

const { width } = Dimensions.get('window');

function renderStars(rating: any) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  for (let i = 0; i < fullStars; i++) {
    stars.push(<FontAwesomeIcon key={`full-${i}`} icon={faStar} size={14} color="#FFD700" />);
  }
  if (hasHalfStar) {
    stars.push(<FontAwesomeIcon key="half" icon={faStar} size={14} color="#FFD700" style={{ opacity: 0.5 }} />);
  }
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<FontAwesomeIcon key={`empty-${i}`} icon={faStar} size={14} color="#C0C0C0" style={{ opacity: 0.5 }} />);
  }
  return stars;
}

const originalImages = [
  { uri: 'https://images.unsplash.com/photo-1532635042-a6f6ad4745f9?q=80' },
  { uri: 'https://images.unsplash.com/photo-1532635042-a6f6ad4745f9?q=80' },
  { uri: 'https://images.unsplash.com/photo-1532635042-a6f6ad4745f9?q=80' },
  // add more images here if needed
];
export default function OrderDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { order } = route.params;

  const [mapExpanded, setMapExpanded] = useState(false);
  const [paid, setPaid] = useState(order.amount < 2000 ? false : true);
  const [editingReceiver, setEditingReceiver] = useState(false);
  const [receiverName, setReceiverName] = useState('Jane Smith');
  const [receiverPhone, setReceiverPhone] = useState('+91-9876543210');
  const [receiverGender, setReceiverGender] = useState('Female');
  const [imageFetchedCount, setImageFetchedCount] = useState(0);
  const [imageRequestedCount, setImageRequestedCount] = useState(0);
  const [lastImageRequestTime, setLastImageRequestTime] = useState<Date | null>(null);
  const [isImageFetching, setIsImageFetching] = useState(false);
  const transporterRating = 3.5;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalButtons, setModalButtons] = useState<any[]>([]); // Array of button objects

  const handlePayment = () => {
    if (!paid) setPaid(true);
  };


  const handleImageRequest = () => {
    if (imageRequestedCount === 0) {
      setModalTitle("Image Requested");
      setModalMessage("Your first image request is free!");
      setModalButtons([
        { text: "OK", onPress: () => setImageRequestedCount(1) }
      ]);
      setIsModalVisible(true);
    } else {
      setModalTitle("Confirm Image Request");
      setModalMessage("Each additional image costs ₹5. Do you want to proceed?");
      setModalButtons([
        { text: "Cancel", onPress: () => { }, style: 'cancel' },
        {
          text: "Yes, Request (₹5)", onPress: () => {
            setImageRequestedCount(prevCount => prevCount + 1);
            // Here you would integrate payment gateway for ₹5 and then trigger image request
            // You can show another modal or a toast here for success
          }
        }
      ]);
      setIsModalVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <FontAwesomeIcon icon={faArrowLeft} size={20} color="#333" />
          </TouchableOpacity>
          <Text style={styles.orderTitle}>Order #{order.id}</Text>
          <View style={{ width: 32 }} />
        </View>

        <Text style={styles.orderTime}>Created on {order.date}, {order.time}</Text>

        <View style={styles.imageContainer}>
          <OrderDetailsCarousel images={originalImages}/>
        </View>

        {/* New Image Request Section */}

        <View className="bg-white p-4 rounded-2xl shadow-sm mt-4 space-y-4">
          <Text className="text-lg font-semibold text-gray-900">
            Request an image of your package!
          </Text>

          <Text className="text-sm text-gray-600 leading-relaxed">
            Your first image is{' '}
            <Text className="text-green-600 font-semibold">FREE!</Text> Subsequent images cost{' '}
            <Text className="text-airbnb-primary font-semibold">₹5</Text> each.
          </Text>

          {(imageRequestedCount > 0 || imageFetchedCount > 0) && (
            <View className="space-y-3">
            <View className='flex-row justify-evenly items-center py-4'>
                {/* Requested */}
                <View className="flex-row items-center space-x-3 ">
                <FontAwesomeIcon icon={faClock} size={18} color="#6b7280" />
                <Text className="text-sm text-gray-800 ml-2">
                  <Text className="font-semibold">Requested:</Text> {imageRequestedCount}
                </Text>
              </View>

              {/* Fetched */}
              <View className="flex-row items-center space-x-3">
                <FontAwesomeIcon icon={faCheckCircle} size={18} color="#10b981" />
                <Text className="text-sm text-gray-800 ml-2">
                  <Text className="font-semibold">Fetched:</Text> {imageFetchedCount}
                </Text>
              </View>
            </View>

              {/* Last Request */}
              {lastImageRequestTime && (
                <View className="flex-row items-center space-x-3">
                  <FontAwesomeIcon icon={faClock} size={18} color="#6b7280" />
                  <Text className="text-sm text-gray-800">
                    <Text className="font-semibold">Last requested:</Text>{' '}
                    {lastImageRequestTime.toLocaleString()}
                  </Text>
                </View>
              )}

              {/* Spinner (if fetching) */}
              {isImageFetching && (
                <View className="flex-row items-center space-x-3">
                  <SpinningIcon icon={faSpinner} size={18} color="#f59e0b" />
                  <Text className="text-sm text-yellow-600 font-medium">
                    Processing latest image…
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Request Button */}
          <TouchableOpacity
            className={`bg-airbnb-primary rounded-xl py-3 mt-3 ${isImageFetching ? 'opacity-60' : ''
              }`}
            onPress={handleImageRequest}
            disabled={isImageFetching}
          >
            <Text className="text-white text-base font-semibold text-center">
              {imageRequestedCount === 0
                ? 'Request First Image (Free)'
                : 'Request Image (₹5)'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionTitle}>Transporter</Text>
            <TouchableOpacity style={styles.sosIcon}>
              <FontAwesomeIcon icon={faShieldAlt} size={18} color="red" />
              <Text>SOS</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.rowStart}>
            <Image source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} style={styles.transporterImage} />
            <View>
              <Text style={styles.infoTextBold}>John Doe (ID: TR1234)</Text>
              <View style={styles.ratingRow}>
                {renderStars(transporterRating)}
                <Text style={styles.ratingText}>{transporterRating.toFixed(1)}</Text>
              </View>
              <View style={styles.statsRow}>
                <FontAwesomeIcon icon={faBoxOpen} size={14} color="#16a34a" />
                <Text style={styles.statText}>52 Orders</Text>
                <FontAwesomeIcon icon={faTimesCircle} size={14} color="#000000" style={{ marginLeft: 12 }} />
                <Text style={styles.statText}>3 Missed</Text>
              </View>
              <View style={styles.transporterIcons}>
                <TouchableOpacity style={[styles.iconButton, { marginRight: 12 }]}>
                  <FontAwesomeIcon icon={faComments} size={20} color="#FF5A5F" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                  <FontAwesomeIcon icon={faPhone} size={20} color="#FF5A5F" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Receiver Details</Text>
          {editingReceiver ? (
            <>
              <TextInput value={receiverName} onChangeText={setReceiverName} style={styles.input} placeholder="Name" />
              <TextInput value={receiverPhone} onChangeText={setReceiverPhone} style={styles.input} placeholder="Phone" />
              <Picker
                selectedValue={receiverGender}
                style={styles.input}
                onValueChange={(itemValue) => setReceiverGender(itemValue)}>
                <Picker.Item label="Male" value="Male" />
                <Picker.Item label="Female" value="Female" />
                <Picker.Item label="Prefer not to say" value="Prefer not to say" />
              </Picker>
              <TouchableOpacity onPress={() => setEditingReceiver(false)} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.infoText}>Name: {receiverName}</Text>
              <Text style={styles.infoText}>Phone: {receiverPhone}</Text>
              <Text style={styles.infoText}>Gender: {receiverGender}</Text>
              <TouchableOpacity onPress={() => setEditingReceiver(true)} style={styles.editReceiverButton}>
                <FontAwesomeIcon icon={faUserEdit} size={16} color="#FF5A5F" />
                <Text style={styles.editReceiverText}>Update Receiver Details</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Shipment Status</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <FontAwesomeIcon icon={faTruck} size={16} color="#3B82F6" style={{ marginRight: 8 }} />
            <Text style={styles.infoText}>Out for Delivery</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <Text style={[styles.infoText, paid ? styles.paidText : styles.pendingText]}>
            Status: {paid ? 'Paid' : 'Pending'}
          </Text>
          <Text style={styles.amountText}>Amount: ₹{order.amount}</Text>

          {!paid && (
            <TouchableOpacity style={styles.payNowButton} onPress={handlePayment}>
              <Text style={styles.payNowText}>Pay ₹{order.amount}</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.mapBox}
          onPress={() => setMapExpanded(!mapExpanded)}
          activeOpacity={0.8}
        >
          <Text style={styles.mapText}>[Map Preview Here]</Text>
          <FontAwesomeIcon
            icon={faMapMarkedAlt}
            size={18}
            color="#555"
            style={styles.enlargeIcon}
          />
        </TouchableOpacity>
        {/* OTP Display Logic */}
        <View style={styles.otpContainer}>
          {!paid ? ( // If not paid, show masked/blurred OTP
            Platform.OS === 'ios' ? (
              // iOS: Blurry masked using BlurView
              <BlurView
                style={styles.blurView}
                blurType="light" // Or "dark", "xlight" based on desired intensity
                blurAmount={30}
                reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.7)" // Fallback for subtle masking
              >
                <View style={styles.otpCenter}>
                  <Text style={styles.otpText}>OTP: 647812</Text>
                </View>
              </BlurView>
            ) : (
              // Android: Masked with asterisks
              <View style={styles.otpCenter}>
                <Text style={styles.otpTextMasked}>OTP: *******</Text>
              </View>
            )
          ) : (
            // If paid, reveal OTP for both platforms
            <View style={styles.otpCenter}>
              <Text style={styles.otpText}>OTP: 647812</Text>
            </View>
          )}
        </View>

        {paid && ( // Reveal Receiver button only appears when paid
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.revealOtpButton}>
              <Text style={styles.revealOtpText}>Send OTP to Receiver</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Place the custom modal here */}
        <CustomAlertModal
          visible={isModalVisible}
          title={modalTitle}
          message={modalMessage}
          buttons={modalButtons}
          onClose={() => setIsModalVisible(false)} // Function to close the modal
        />
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  otpTextMasked: { // New style for the Android masked OTP
    fontSize: 24,
    fontWeight: 'bold',
    color: '#555', // A neutral color for masked text
    letterSpacing: 4,
  },
  backButton: {
    padding: 6,
  },
  orderTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  orderTime: { textAlign: 'center', color: '#666', marginBottom: 16 },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sosIcon: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#ffe5e5',
    borderRadius: 8,
  },
  rowStart: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  transporterImage: { width: 64, height: 64, borderRadius: 32, marginRight: 12 },
  transporterIcons: { flexDirection: 'row', marginTop: 8 },
  iconButton: {
    backgroundColor: '#fff0f0',
    padding: 15,
    borderRadius: 20,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ratingText: { marginLeft: 6, color: '#666', fontSize: 12 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  statText: { fontSize: 12, color: '#555', marginLeft: 4 },
  infoTextBold: { color: '#333', fontWeight: '600', fontSize: 14 },
  infoText: { fontSize: 14, color: '#555', marginBottom: 4 },
  editReceiverButton: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  editReceiverText: { marginLeft: 6, color: '#FF5A5F', fontWeight: '500', fontSize: 13 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 10 },
  saveButton: { backgroundColor: '#16a34a', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: 'white', fontWeight: '600' },
  paidText: { color: 'green', fontWeight: 'bold', marginTop: 4 },
  pendingText: { color: '#d97706', fontWeight: 'bold', marginTop: 4 },
  amountText: { fontSize: 16, fontWeight: 'bold', color: 'green', marginTop: 4 },
  payNowButton: {
    marginTop: 12,
    backgroundColor: '#FF5A5F',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  payNowText: { color: 'white', fontWeight: '600' },
  mapBox: {
    marginHorizontal: 16,
    height: 150,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  mapText: { color: '#555' },
  enlargeIcon: { position: 'absolute', top: 10, right: 10 },
  otpContainer: {
    width: '80%',
    height: 80,
    marginHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  otpText: { fontSize: 24, fontWeight: 'bold', color: '#16a34a', letterSpacing: 4 },
  blurredOtp: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ababab',
    marginTop: 20,
    letterSpacing: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  revealOtpButton: {
    backgroundColor: '#FF5A5F',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  revealOtpText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    overflow: 'hidden',
  },

  blurFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // semi-transparent white
  },

  otpCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageRequestContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20, /* Add margin to separate from next card */
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  imageRequestHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  imageRequestSubText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
    lineHeight: 20,
  },
  imageRequestButton: {
    backgroundColor: 'black', /* A nice green color */
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    minWidth: 200,
    alignItems: 'center',
  },
  imageRequestButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
