import React, { useEffect, useState } from 'react';
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
  Modal,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
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
  faClock,
  faCheckCircle,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';

// Assuming these components are in a 'components' directory relative to this file
import OrderDetailsCarousel from '../components/OrderDetailsCarousel';
import CustomAlertModal from '../components/CustomAlertModal';
import { SpinningIcon } from '../components/SpinningIcon';

// Import your RootStackParamList
import { RootStackParamList } from '../types';

const { width } = Dimensions.get('window');

/**
 * Renders star icons based on a given rating.
 * @param {number} rating - The numerical rating to display (e.g., 3.5).
 * @returns {JSX.Element[]} An array of FontAwesomeIcon components representing stars.
 */
function renderStars(rating: number) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  for (let i = 0; i < fullStars; i++) {
    stars.push(<FontAwesomeIcon key={`full-${i}`} icon={faStar} size={14} color="#FFD700" />);
  }
  if (hasHalfStar) {
    stars.push(
      <FontAwesomeIcon key="half" icon={faStar} size={14} color="#FFD700" className="opacity-50" />
    );
  }
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <FontAwesomeIcon key={`empty-${i}`} icon={faStar} size={14} color="#C0C0C0" className="opacity-50" />
    );
  }
  return stars;
}

/**
 * Defines the structure of the order data.
 */
interface Order {
  id: string;
  date: string;
  time: string;
  amount: number;
  status: 'ongoing' | 'completed';
  initialImages?: { uri: string }[];
  source?: string;
  destination?: string;
  // Add any other fields your order object might have
}

/**
 * SenderOngoingScreen component displays details for an ongoing order.
 * It allows senders to view order status, transporter details, request package images,
 * update receiver information, and manage payments.
 */
export default function SenderOngoing() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'SenderOngoing'>>();
  const route = useRoute<any>();

  // Order details state
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const orderId = String(route.params?.orderId ?? '');

  // UI related states
  const [mapExpanded, setMapExpanded] = useState(false);
  const [paid, setPaid] = useState(false);

  // Receiver details states
  const [receiverName, setReceiverName] = useState('Jane Smith');
  const [receiverPhone, setReceiverPhone] = useState('+91-9876543210');
  const [receiverGender, setReceiverGender] = useState('Female'); // Default value

  // Receiver update modal states
  const [isUpdateReceiverModalVisible, setIsUpdateReceiverModalVisible] = useState(false);
  const [tempReceiverName, setTempReceiverName] = useState('');
  const [tempReceiverPhone, setTempReceiverPhone] = useState('');
  const [tempReceiverGender, setTempReceiverGender] = useState(''); // State for modal input

  // Image request states
  const [imageFetchedCount, setImageFetchedCount] = useState(0);
  const [imageRequestedCount, setImageRequestedCount] = useState(0);
  const [lastImageRequestTime, setLastImageRequestTime] = useState<Date | null>(null);
  const [isImageFetching, setIsImageFetching] = useState(false);

  // Custom alert modal states
  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false);
  const [alertModalTitle, setAlertModalTitle] = useState('');
  const [alertModalMessage, setAlertModalMessage] = useState('');
  const [alertModalButtons, setAlertModalButtons] = useState<any[]>([]);

  // Static transporter rating for demonstration
  const transporterRating = 3.5;

  /**
   * Fetches order details based on the provided order ID.
   * This is a mock function; in a real application, it would make an API call.
   * @param {string | number} id - The ID of the order to fetch.
   * @returns {Promise<Order | null>} A promise that resolves to the order object or null if not found/error.
   */
  const fetchOrderDetails = async (id: string | number): Promise<Order | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockOrder: Order = {
        id: String(id),
        date: 'July 4, 2025',
        time: '10:00 AM',
        amount: 1500,
        status: 'ongoing',
        initialImages: [
          { uri: 'https://placehold.co/600x400/FF5A5F/FFFFFF?text=Package+1' },
          { uri: 'https://placehold.co/600x400/3B82F6/FFFFFF?text=Package+2' },
          { uri: 'https://placehold.co/600x400/10B981/FFFFFF?text=Package+3' },
        ],
        source: 'Hyderabad',
        destination: 'Bangalore',
      };

      setPaid(mockOrder.amount >= 2000); // Mock payment status based on amount
      return mockOrder;
    } catch (err) {
      console.error('Failed to fetch mock order details:', err);
      setError('Failed to load order details. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Effect hook to fetch order details when the component mounts or orderId changes.
   * It also handles navigation redirection if the order status is 'completed'.
   */
  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId).then(data => {
        if (data && data.status === 'ongoing') {
          setOrder(data);
        } else if (data && data.status === 'completed') {
          // If order is already completed, navigate to SenderCompleted screen
          navigation.replace('SenderCompleted', { orderId: data.id });
        } else {
          setError('Order not found or is not an ongoing order.');
        }
      });
    } else {
      setError('No order ID provided. Please go back and select an order.');
      setIsLoading(false);
    }
  }, [orderId, navigation]); // Dependencies for useEffect

  /**
   * Handles the payment process for the order.
   * Displays a success alert upon successful payment.
   */
  const handlePayment = () => {
    if (order && !paid) {
      setPaid(true); // Simulate payment success
      setAlertModalTitle('Payment Successful');
      setAlertModalMessage(`You have successfully paid ₹${order.amount}.`);
      setAlertModalButtons([{ text: 'OK', onPress: () => setIsAlertModalVisible(false) }]);
      setIsAlertModalVisible(true);
    }
  };

  /**
   * Manages the request for package images.
   * Directly initiates the request and shows success message.
   */
  const handleImageRequest = () => {
    if (isImageFetching) return; // Prevent multiple requests while one is in progress

    // Increment requested count immediately
    setImageRequestedCount(prevCount => prevCount + 1);
    setLastImageRequestTime(new Date());
    setIsImageFetching(true); // Indicate that fetching is in progress

    // Simulate image fetching delay
    setTimeout(() => {
      setIsImageFetching(false); // End fetching status
      setImageFetchedCount(prev => prev + 1); // Increment fetched count
      setAlertModalTitle('Image Received!');
      setAlertModalMessage('The requested image has been sent to your account.');
      setAlertModalButtons([{ text: 'OK', onPress: () => setIsAlertModalVisible(false) }]);
      setIsAlertModalVisible(true); // Show success message
    }, 3000); // 3-second delay
  };


  /**
   * Opens the receiver update modal, pre-filling with current details.
   */
  const openUpdateReceiverModal = () => {
    setTempReceiverName(receiverName);
    setTempReceiverPhone(receiverPhone);
    setTempReceiverGender(receiverGender);
    setIsUpdateReceiverModalVisible(true);
  };

  /**
   * Saves the temporary receiver details to the main state.
   * In a real application, this would involve an API call to update the backend.
   */
  const saveReceiverDetails = () => {
    // In a real app, you'd send these updates to your backend
    // and handle success/failure, then update local state.
    setReceiverName(tempReceiverName);
    setReceiverPhone(tempReceiverPhone);
    setReceiverGender(tempReceiverGender);
    setIsUpdateReceiverModalVisible(false);
    // Optionally show a confirmation alert
    setAlertModalTitle('Receiver Details Updated');
    setAlertModalMessage('Receiver details have been successfully updated!');
    setAlertModalButtons([{ text: 'OK', onPress: () => setIsAlertModalVisible(false) }]);
    setIsAlertModalVisible(true);
  };

  // Render loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <SpinningIcon icon={faSpinner} size={40} color="#FF5A5F" />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error || 'Order not found.'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
          <Text style={styles.goBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <FontAwesomeIcon icon={faArrowLeft} size={20} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order #{order.id}</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>

        <Text style={styles.orderDateText}>Created on {order.date}, {order.time}</Text>

        {/* Order Images Section (No Card Styling) */}
        {order.initialImages && order.initialImages.length > 0 && (
          <View className='mb-4'>
            <Text style={styles.sectionTitle} className='ml-4'>Package Images</Text>
            {/* The carousel directly handles its own appearance now */}
            <OrderDetailsCarousel images={order.initialImages} />
          </View>
        )}

        {/* Image Request Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitleCenter}>Request an image of your package!</Text>
          <Text style={styles.imageRequestDescription}>
            Your first image is <Text style={styles.freeText}>FREE!</Text> Subsequent images cost{' '}
            <Text style={styles.costText}>₹5</Text> each.
          </Text>

          {(imageRequestedCount > 0 || imageFetchedCount > 0) && (
            <View style={styles.imageRequestStats}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <FontAwesomeIcon icon={faClock} size={18} color="#6b7280" />
                  <Text style={styles.statText}>
                    <Text style={styles.statLabel}>Requested:</Text> {imageRequestedCount}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <FontAwesomeIcon icon={faCheckCircle} size={18} color="#10b981" />
                  <Text style={styles.statText}>
                    <Text style={styles.statLabel}>Fetched:</Text> {imageFetchedCount}
                  </Text>
                </View>
              </View>

              {lastImageRequestTime && (
                <View style={styles.statItem}>
                  <FontAwesomeIcon icon={faClock} size={18} color="#6b7280" />
                  <Text style={styles.statText}>
                    <Text style={styles.statLabel}>Last requested:</Text>{' '}
                    {lastImageRequestTime.toLocaleString()}
                  </Text>
                </View>
              )}

              {isImageFetching && (
                <View style={styles.statItem}>
                  <SpinningIcon icon={faSpinner} size={18} color="#f59e0b" />
                  <Text style={styles.fetchingText}>Processing latest image…</Text>
                </View>
              )}
            </View>
          )}

          <TouchableOpacity
            style={[styles.requestImageButton, isImageFetching && styles.disabledButton]}
            onPress={handleImageRequest}
            disabled={isImageFetching}
          >
            <Text style={styles.requestImageButtonText}>
              {imageRequestedCount === 0 ? 'Request First Image (Free)' : 'Request Image (₹5)'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Transporter Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderWithAction}>
            <Text style={styles.cardTitle}>Transporter</Text>
            <TouchableOpacity style={styles.sosButton}>
              <FontAwesomeIcon icon={faShieldAlt} size={18} color="red" />
              <Text style={styles.sosButtonText}>SOS</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.transporterInfo}>
            <Image
              source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
              style={styles.transporterImage}
            />
            <View>
              <Text style={styles.transporterName}>John Doe (ID: TR1234)</Text>
              <View style={styles.ratingContainer}>
                {renderStars(transporterRating)}
                <Text style={styles.ratingText}>{transporterRating.toFixed(1)}</Text>
              </View>
              <View style={styles.transporterStats}>
                <FontAwesomeIcon icon={faBoxOpen} size={14} color="#16a34a" />
                <Text style={styles.statTextSm}>52 Orders</Text>
                <FontAwesomeIcon icon={faTimesCircle} size={14} color="#000000" style={styles.statIconMargin} />
                <Text style={styles.statTextSm}>3 Missed</Text>
              </View>
              <View style={styles.transporterActions}>
                <TouchableOpacity style={styles.transporterActionButton}>
                  <FontAwesomeIcon icon={faComments} size={20} color="#FF5A5F" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.transporterActionButton}>
                  <FontAwesomeIcon icon={faPhone} size={20} color="#FF5A5F" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Receiver Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Receiver Details</Text>
          <Text style={styles.detailText}>Name: {receiverName}</Text>
          <Text style={styles.detailText}>Phone: {receiverPhone}</Text>
          <Text style={styles.detailText}>Gender: {receiverGender}</Text>

          <TouchableOpacity style={styles.updateReceiverButton} onPress={openUpdateReceiverModal}>
            <FontAwesomeIcon icon={faUserEdit} size={16} color="#FF5A5F" />
            <Text style={styles.updateReceiverButtonText}>Update Receiver Details</Text>
          </TouchableOpacity>
        </View>

        {/* Shipment Status Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Shipment Status</Text>
          <View style={styles.statusRow}>
            <FontAwesomeIcon icon={faTruck} size={16} color="#3B82F6" style={styles.statusIcon} />
            <Text style={styles.detailText}>Out for Delivery</Text>
          </View>
        </View>

        {/* Payment Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment</Text>
          <Text style={[styles.paymentStatusText, paid ? styles.paymentPaid : styles.paymentPending]}>
            Status: {paid ? 'Paid' : 'Pending'}
          </Text>
          <Text style={styles.paymentAmountText}>Amount: ₹{order.amount}</Text>

          {!paid && (
            <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
              <Text style={styles.payButtonText}>Pay ₹{order.amount}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Map Preview Card */}
        <TouchableOpacity
          style={styles.mapPreviewCard}
          onPress={() => setMapExpanded(!mapExpanded)}
          activeOpacity={0.8}
        >
          <Text style={styles.mapPlaceholderText}>[Map Preview Here]</Text>
          <FontAwesomeIcon
            icon={faMapMarkedAlt}
            size={18}
            color="#555"
            style={styles.mapIcon}
          />
        </TouchableOpacity>

        {/* Delivery OTP Card */}
        <View style={[styles.card, styles.otpCard]}>
          <Text style={styles.cardTitle}>Delivery OTP</Text>
          {!paid ? (
            Platform.OS === 'ios' ? (
              <BlurView
                style={styles.otpBlurView}
                blurType="light"
                blurAmount={10}
                reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.7)"
              >
                <Text style={styles.otpMaskedText}>OTP: *******</Text>
              </BlurView>
            ) : (
              <View style={styles.otpMaskedContainer}>
                <Text style={styles.otpMaskedText}>OTP: *******</Text>
              </View>
            )
          ) : (
            <View style={styles.otpVisibleContainer}>
              <Text style={styles.otpVisibleText}>OTP: 647812</Text>
            </View>
          )}
        </View>

        {/* Action Buttons (e.g., Send OTP) */}
        {paid && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.sendOtpButton}>
              <Text style={styles.sendOtpButtonText}>Send OTP to Receiver</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Custom Alert Modal (for general alerts) */}
        <CustomAlertModal
          visible={isAlertModalVisible}
          title={alertModalTitle}
          message={alertModalMessage}
          buttons={alertModalButtons}
          onClose={() => setIsAlertModalVisible(false)}
        />
      </ScrollView>

      {/* Receiver Update Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isUpdateReceiverModalVisible}
        onRequestClose={() => setIsUpdateReceiverModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.centeredView}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Update Receiver Details</Text>

                <TextInput
                  style={styles.modalTextInput}
                  placeholder="Receiver Name"
                  value={tempReceiverName}
                  onChangeText={setTempReceiverName}
                  placeholderTextColor="#888"
                />
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="Receiver Phone"
                  value={tempReceiverPhone}
                  onChangeText={setTempReceiverPhone}
                  keyboardType="phone-pad"
                  placeholderTextColor="#888"
                />

                {/* Segmented control for Gender */}
                <View style={styles.genderSelectionContainer}>
                  {['Male', 'Female', 'Prefer not to say'].map(genderOption => (
                    <TouchableOpacity
                      key={genderOption}
                      style={[
                        styles.genderButton,
                        tempReceiverGender === genderOption && styles.genderButtonSelected,
                      ]}
                      onPress={() => setTempReceiverGender(genderOption)}
                    >
                      <Text
                        style={[
                          styles.genderButtonText,
                          tempReceiverGender === genderOption && styles.genderButtonTextSelected,
                        ]}
                      >
                        {genderOption}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => setIsUpdateReceiverModalVisible(false)}
                  >
                    <Text style={styles.modalCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalSaveButton} onPress={saveReceiverDetails}>
                    <Text style={styles.modalSaveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8', // Light grey background for the whole screen
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#4a5568', // Gray-700
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444', // Red-500
    textAlign: 'center',
    marginHorizontal: 20,
  },
  goBackButton: {
    marginTop: 20,
    backgroundColor: '#ef4444', // Red-500
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  goBackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a202c', // Gray-800
  },
  headerRightPlaceholder: {
    width: 32, // To balance the back button
  },
  orderDateText: {
    textAlign: 'center',
    color: '#4a5568', // Gray-600
    marginBottom: 20,
    fontSize: 14,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3, // For Android shadow
  },
  // New style for the image section container
  imageSectionContainer: {
    marginHorizontal: 16, // Match card horizontal margin
    marginBottom: 20, // Match card bottom margin
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a202c', // Gray-800
    marginBottom: 12,
    paddingLeft: 4, // Slight padding to align with carousel if needed
  },
  sectionTitleCenter: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a202c', // Gray-800
    marginBottom: 8,
    textAlign: 'center',
  },
  imageRequestDescription: {
    fontSize: 14,
    color: '#4a5568', // Gray-600
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  freeText: {
    color: '#22c55e', // Green-500
    fontWeight: 'bold',
  },
  costText: {
    color: '#ef4444', // Red-500
    fontWeight: 'bold',
  },
  imageRequestStats: {
    marginBottom: 16,
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginTop: 4,
  },
  statLabel: {
    fontWeight: 'bold',
  },
  statText: {
    fontSize: 14,
    color: '#4a5568', // Gray-700
    marginLeft: 8,
  },
  fetchingText: {
    fontSize: 14,
    color: '#f97316', // Orange-600
    fontWeight: '600',
    marginLeft: 8,
  },
  requestImageButton: {
    backgroundColor: '#ef4444', // Red-500
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 12,
    alignItems: 'center',
  },
  requestImageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  cardHeaderWithAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sosButton: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fef2f2', // Red-50
    borderRadius: 8,
  },
  sosButtonText: {
    fontSize: 10,
    color: '#ef4444', // Red-500
    marginTop: 2,
    fontWeight: '600',
  },
  transporterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10, // Modern way for spacing in flexbox
  },
  transporterImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12,
  },
  transporterName: {
    fontSize: 15,
    color: '#1a202c', // Gray-800
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    marginLeft: 6,
    color: '#4a5568', // Gray-600
    fontSize: 12,
  },
  transporterStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  statTextSm: {
    fontSize: 12,
    color: '#4a5568', // Gray-700
    marginLeft: 4,
  },
  statIconMargin: {
    marginLeft: 12,
  },
  transporterActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  transporterActionButton: {
    backgroundColor: '#fef2f2', // Red-50
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#4a5568', // Gray-600
    marginBottom: 4,
  },
  updateReceiverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#fef2f2', // Red-50
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  updateReceiverButtonText: {
    marginLeft: 8,
    color: '#ef4444', // Red-500
    fontWeight: '600',
    fontSize: 14,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusIcon: {
    marginRight: 8,
  },
  paymentStatusText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  paymentPaid: {
    color: '#16a34a', // Green-600
  },
  paymentPending: {
    color: '#f97316', // Orange-600
  },
  paymentAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16a34a', // Green-600
    marginTop: 4,
  },
  payButton: {
    marginTop: 12,
    backgroundColor: '#ef4444', // Red-500
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  mapPreviewCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    height: 144, // Fixed height
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mapPlaceholderText: {
    color: '#4a5568', // Gray-600
    fontSize: 16,
  },
  mapIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  otpCard: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120, // Ensure enough space for OTP
  },
  otpBlurView: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpMaskedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpMaskedText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a5568', // Gray-600
    letterSpacing: 2,
  },
  otpVisibleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpVisibleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#16a34a', // Green-600
    letterSpacing: 2,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  sendOtpButton: {
    backgroundColor: '#ef4444', // Red-500
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  sendOtpButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)', // Darker dim background
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%', // Wider modal
    maxWidth: 400, // Max width for larger screens
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a202c', // Gray-800
    marginBottom: 20,
    textAlign: 'center',
  },
  modalTextInput: {
    borderWidth: 1,
    borderColor: '#cbd5e0', // Gray-300
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 16, // Increased spacing
    fontSize: 16,
    color: '#1a202c', // Gray-800
  },
  genderSelectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 8,
    overflow: 'hidden', // Ensures inner elements conform to border radius
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
    // Add border for separation between buttons if desired, or rely on background change
  },
  genderButtonSelected: {
    backgroundColor: '#ef4444', // Red-500
  },
  genderButtonText: {
    fontSize: 15,
    color: '#4a5568', // Gray-700
    fontWeight: '600',
  },
  genderButtonTextSelected: {
    color: '#fff',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalCancelButton: {
    backgroundColor: '#e2e8f0', // Gray-200
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#4a5568', // Gray-700
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalSaveButton: {
    backgroundColor: '#ef4444', // Red-500
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  modalSaveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});