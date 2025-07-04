import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faArrowLeft,
  faCheckCircle,
  faStar,
  faBoxOpen,
  faCalendarAlt,
  faRupeeSign,
  faMapMarkerAlt,
  faLocationArrow,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';

// Import your RootStackParamList if it's defined
import { RootStackParamList } from '../types'; // Adjust path if necessary

// Assuming these components are in a 'components' directory relative to this file
import OrderDetailsCarousel from '../components/OrderDetailsCarousel';
import CustomAlertModal from '../components/CustomAlertModal'; // <--- ADDED IMPORT
import { SpinningIcon } from '../components/SpinningIcon';

const { width } = Dimensions.get('window');

/**
 * Renders star icons based on a given rating.
 * @param {number} rating - The numerical rating to display (e.g., 3.5).
 * @param {number} maxStars - The maximum number of stars (default 5).
 * @param {number} size - The size of the star icons (default 20).
 * @returns {JSX.Element[]} An array of FontAwesomeIcon components representing stars.
 */
function renderStars(rating: number, maxStars: number = 5, size: number = 20) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

  for (let i = 0; i < fullStars; i++) {
    stars.push(<FontAwesomeIcon key={`full-${i}`} icon={faStar} size={size} color="#FFD700" />);
  }
  if (hasHalfStar) {
    stars.push(
      <FontAwesomeIcon key="half" icon={faStar} size={size} color="#FFD700" className="opacity-50" />
    );
  }
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <FontAwesomeIcon key={`empty-${i}`} icon={faStar} size={size} color="#C0C0C0" className="opacity-50" />
    );
  }
  return stars;
}

/**
 * Defines the structure of the order data for a completed order.
 */
interface CompletedOrder {
  id: string;
  date: string;
  time: string;
  amount: number;
  deliveryDate: string;
  deliveryTime: string;
  proofOfDeliveryImages?: { uri: string }[];
  source: string;
  destination: string;
  transporterName: string;
  transporterRating: number;
}

/**
 * SenderCompletedScreen component displays details for a completed order.
 * It shows a confirmation, final details, and options for post-delivery actions.
 */
export default function SenderCompletedScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'SenderCompleted'>>();
  const route = useRoute<any>();

  const [order, setOrder] = useState<CompletedOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const orderId = String(route.params?.orderId ?? '');

  // State for user's selected rating and whether rating has been submitted
  const [userRating, setUserRating] = useState<number>(0);
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(false); // <--- ADDED STATE

  // Custom Alert Modal states
  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false);
  const [alertModalTitle, setAlertModalTitle] = useState('');
  const [alertModalMessage, setAlertModalMessage] = useState('');
  const [alertModalButtons, setAlertModalButtons] = useState<any[]>([]);

  /**
   * Shows the custom alert modal with specified title, message, and buttons.
   */
  const showAlert = (title: string, message: string, buttons: any[] = [{ text: 'OK', onPress: () => setIsAlertModalVisible(false) }]) => {
    setAlertModalTitle(title);
    setAlertModalMessage(message);
    setAlertModalButtons(buttons);
    setIsAlertModalVisible(true);
  };

  /**
   * Fetches completed order details.
   * This is a mock function; in a real app, it would be an API call.
   */
  const fetchCompletedOrderDetails = async (id: string | number): Promise<CompletedOrder | null> => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay

      const mockCompletedOrder: CompletedOrder = {
        id: String(id),
        date: 'July 1, 2025',
        time: '09:30 AM',
        amount: 1500,
        deliveryDate: 'July 4, 2025',
        deliveryTime: '02:45 PM',
        proofOfDeliveryImages: [
          { uri: 'https://placehold.co/600x400/22C55E/FFFFFF?text=Delivered+Proof+1' },
          { uri: 'https://placehold.co/600x400/22C55E/FFFFFF?text=Delivered+Proof+2' },
          { uri: 'https://placehold.co/600x400/22C55E/FFFFFF?text=Delivered+Proof+3' },
        ],
        source: 'Hyderabad',
        destination: 'Bangalore',
        transporterName: 'David Lee (TR1235)',
        transporterRating: 4.8, // Transporter's existing average rating
      };
      return mockCompletedOrder;
    } catch (err) {
      console.error('Failed to fetch completed order details:', err);
      setError('Failed to load completed order details. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchCompletedOrderDetails(orderId).then(data => {
        if (data) {
          setOrder(data);
        } else {
          setError('Completed order not found.');
        }
      });
    } else {
      setError('No order ID provided for completed order.');
      setIsLoading(false);
    }
  }, [orderId]);

  /**
   * Handles submitting the user's rating for the transporter.
   * In a real app, this would send the rating to the backend.
   */
  const handleSubmitRating = () => {
    if (userRating > 0) {
      // Logic to send rating to your backend
      console.log(`Submitting rating for transporter: ${userRating} stars`);
      showAlert('Rating Submitted!', `Thank you for rating! You gave ${userRating} stars. Your feedback is valuable.`); // <--- Using CustomAlertModal
      setRatingSubmitted(true); // <--- Set state to hide button
    } else {
      showAlert('Rating Required', 'Please select a star rating before submitting.'); // <--- Using CustomAlertModal
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <SpinningIcon icon={faSpinner} size={40} color="#FF5A5F" />
        <Text style={styles.loadingText}>Loading completed order...</Text>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error || 'Completed order details not available.'}</Text>
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

        {/* Delivery Confirmation */}
        <View style={styles.completionConfirmation}>
          <FontAwesomeIcon icon={faCheckCircle} size={40} color="#22c55e" />
          <Text style={styles.completionText}>Order Delivered!</Text>
          <Text style={styles.deliveryTimestamp}>
            Delivered on {order.deliveryDate} at {order.deliveryTime}
          </Text>
        </View>

        {/* Order Summary Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          <View style={styles.detailRow}>
            <FontAwesomeIcon icon={faCalendarAlt} size={16} color="#6b7280" style={styles.detailIcon} />
            <Text style={styles.detailText}>Placed on: {order.date}, {order.time}</Text>
          </View>
          <View style={styles.detailRow}>
            <FontAwesomeIcon icon={faRupeeSign} size={16} color="#6b7280" style={styles.detailIcon} />
            <Text style={styles.detailText}>Amount: ₹{order.amount}</Text>
          </View>
          <View style={styles.detailRow}>
            <FontAwesomeIcon icon={faMapMarkerAlt} size={16} color="#6b7280" style={styles.detailIcon} />
            <Text style={styles.detailText}>From: {order.source}</Text>
          </View>
          <View style={styles.detailRow}>
            <FontAwesomeIcon icon={faLocationArrow} size={16} color="#6b7280" style={styles.detailIcon} />
            <Text style={styles.detailText}>To: {order.destination}</Text>
          </View>
        </View>

        {/* Transporter Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Transporter Details</Text>
          <View style={styles.transporterInfo}>
            <Image
              source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
              style={styles.transporterImage}
            />
            <View>
              <Text style={styles.transporterName}>{order.transporterName}</Text>
              <View style={styles.ratingContainer}>
                {renderStars(order.transporterRating, 5, 16)} {/* Transporter's overall rating */}
                <Text style={styles.ratingText}>{order.transporterRating.toFixed(1)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Rate Transporter Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Rate Your Transporter</Text>
          {ratingSubmitted ? ( // <--- Conditional rendering based on ratingSubmitted
            <View style={styles.ratingSubmittedContainer}>
              <FontAwesomeIcon icon={faCheckCircle} size={30} color="#10b981" />
              <Text style={styles.ratingSubmittedText}>You rated {userRating} stars!</Text>
            </View>
          ) : (
            <>
              <Text style={styles.ratingPrompt}>Help us improve by rating your experience!</Text>
              <View style={styles.userRatingContainer}>
                {[1, 2, 3, 4, 5].map(star => (
                  <TouchableOpacity key={star} onPress={() => setUserRating(star)}>
                    <FontAwesomeIcon
                      icon={faStar}
                      size={30}
                      color={star <= userRating ? '#FFD700' : '#E0E0E0'}
                      style={styles.starIcon}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.submitRatingButton, userRating === 0 && styles.disabledButton]}
                onPress={handleSubmitRating}
                disabled={userRating === 0}
              >
                <Text style={styles.submitRatingButtonText}>Submit Rating</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Proof of Delivery Images */}
        {order.proofOfDeliveryImages && order.proofOfDeliveryImages.length > 0 && (
          <View>
            <Text style={styles.sectionTitle} className='ml-4'>Proof of Delivery Images</Text>
            <OrderDetailsCarousel images={order.proofOfDeliveryImages} />
          </View>
        )}

        {/* Removed Back to Dashboard Button as per request */}
        {/* <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.backToDashboardButton}
            onPress={() => navigation.navigate('SenderDashboard')}
          >
            <Text style={styles.backToDashboardButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View> */}
      </ScrollView>

      {/* Custom Alert Modal (for general alerts) */}
      <CustomAlertModal
        visible={isAlertModalVisible}
        title={alertModalTitle}
        message={alertModalMessage}
        buttons={alertModalButtons}
        onClose={() => setIsAlertModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8', // Light grey background
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
    color: '#4a5568',
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  goBackButton: {
    marginTop: 20,
    backgroundColor: '#ef4444',
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
    color: '#1a202c',
  },
  headerRightPlaceholder: {
    width: 32, // To balance the back button
  },
  completionConfirmation: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#e6ffed', // Light green background for confirmation
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  completionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#16a34a', // Darker green text
    marginTop: 10,
  },
  deliveryTimestamp: {
    fontSize: 14,
    color: '#4a5568',
    marginTop: 5,
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
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailIcon: {
    marginRight: 10,
  },
  detailText: {
    fontSize: 16,
    color: '#4a5568',
  },
  transporterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  transporterImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  transporterName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  ratingText: {
    marginLeft: 8,
    color: '#4a5568',
    fontSize: 14,
  },
  ratingPrompt: {
    fontSize: 15,
    color: '#4a5568',
    marginBottom: 15,
    textAlign: 'center',
  },
  userRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  starIcon: {
    marginHorizontal: 5,
  },
  submitRatingButton: {
    backgroundColor: '#FF5A5F',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitRatingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  ratingSubmittedContainer: { // <--- NEW STYLE
    alignItems: 'center',
    paddingVertical: 10,
  },
  ratingSubmittedText: { // <--- NEW STYLE
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
    marginTop: 10,
  },
  imageSectionContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 12,
    paddingLeft: 4,
  },
  // Removed actionButtonsContainer and backToDashboardButton styles
});