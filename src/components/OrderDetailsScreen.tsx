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
  faClock, faCheckCircle, faSpinner, faMapPin
} from '@fortawesome/free-solid-svg-icons';
import { Picker } from '@react-native-picker/picker';

import OrderDetailsCarousel from '../components/ImageCarousel';

import CustomAlertModal from './CustomAlertModal';
import { SpinningIcon } from './SpinningIcon';

const { width } = Dimensions.get('window');

function renderStars(rating: number) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  for (let i = 0; i < fullStars; i++) {
    stars.push(<FontAwesomeIcon key={`full-${i}`} icon={faStar} size={14} color="#FFD700" />);
  }
  if (hasHalfStar) {
    stars.push(<FontAwesomeIcon key="half" icon={faStar} size={14} color="#FFD700" style={styles.halfStar} />);
  }
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<FontAwesomeIcon key={`empty-${i}`} icon={faStar} size={14} color="#C0C0C0" style={styles.emptyStar} />);
  }
  return stars;
}

interface OrderDetailsRouteParams {
  order: {
    id: string;
    date: string;
    time: string;
    amount: number;
    status: 'ongoing' | 'completed';
    initialImages?: { uri: string }[];
    source?: string;
    destination?: string;
  };
}

export default function OrderDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { order } = route.params as OrderDetailsRouteParams;

  const sourceLocation = order.source || 'Hyderabad';
  const destinationLocation = order.destination || 'Bangalore';

  const [mapExpanded, setMapExpanded] = useState(false);
  const [paid, setPaid] = useState(order.status === 'completed' ? true : (order.amount < 2000 ? false : true));
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
  const [modalButtons, setModalButtons] = useState<any[]>([]);

  const handlePayment = () => {
    if (!paid) {
      setPaid(true);
      Alert.alert("Payment Successful", `You have successfully paid ₹${order.amount}.`);
    }
  };

  const handleImageRequest = () => {
    if (imageRequestedCount === 0) {
      setModalTitle("Image Requested");
      setModalMessage("Your first image request is free!");
      setModalButtons([
        { text: "OK", onPress: () => {
          setImageRequestedCount(1);
          setIsModalVisible(false);
          setLastImageRequestTime(new Date());
          setIsImageFetching(true);
          setTimeout(() => {
            setIsImageFetching(false);
            setImageFetchedCount(prev => prev + 1);
            Alert.alert('Image Received!', 'The requested image has been sent to your account.');
          }, 3000);
        }}
      ]);
      setIsModalVisible(true);
    } else {
      setModalTitle("Confirm Image Request");
      setModalMessage("Each additional image costs ₹5. Do you want to proceed?");
      setModalButtons([
        { text: "Cancel", onPress: () => setIsModalVisible(false), style: 'cancel' },
        {
          text: "Yes, Request (₹5)", onPress: () => {
            setImageRequestedCount(prevCount => prevCount + 1);
            setIsModalVisible(false);
            setLastImageRequestTime(new Date());
            setIsImageFetching(true);
            setTimeout(() => {
                setIsImageFetching(false);
                setImageFetchedCount(prev => prev + 1);
                Alert.alert('Image Received!', 'The requested image has been sent to your account.');
            }, 3000);
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
          <View style={styles.headerRightPlaceholder} />
        </View>

        <Text style={styles.orderTime}>Created on {order.date}, {order.time}</Text>

        {order.initialImages && order.initialImages.length > 0 && (
            <View style={styles.imageContainer}>
              <OrderDetailsCarousel images={order.initialImages} />
            </View>
        )}

        {order.status === 'ongoing' && (
          <View style={styles.imageRequestCard}>
            <Text style={styles.imageRequestTitle}>
              Request an image of your package!
            </Text>

            <Text style={styles.imageRequestSubText}>
              Your first image is{' '}
              <Text style={styles.imageRequestFreeText}>FREE!</Text> Subsequent images cost{' '}
              <Text style={styles.imageRequestCostText}>₹5</Text> each.
            </Text>

            {(imageRequestedCount > 0 || imageFetchedCount > 0) && (
              <View style={styles.imageRequestDetailsContainer}>
                <View style={styles.imageRequestStatsRow}>
                  <View style={styles.imageRequestStatItem}>
                    <FontAwesomeIcon icon={faClock} size={18} color="#6b7280" />
                    <Text style={styles.imageRequestStatText}>
                      <Text style={styles.imageRequestStatBold}>Requested:</Text> {imageRequestedCount}
                    </Text>
                  </View>

                  <View style={styles.imageRequestStatItem}>
                    <FontAwesomeIcon icon={faCheckCircle} size={18} color="#10b981" />
                    <Text style={styles.imageRequestStatText}>
                      <Text style={styles.imageRequestStatBold}>Fetched:</Text> {imageFetchedCount}
                    </Text>
                  </View>
                </View>

                {lastImageRequestTime && (
                  <View style={styles.imageRequestLastRequest}>
                    <FontAwesomeIcon icon={faClock} size={18} color="#6b7280" />
                    <Text style={styles.imageRequestLastRequestText}>
                      <Text style={styles.imageRequestStatBold}>Last requested:</Text>{' '}
                      {lastImageRequestTime.toLocaleString()}
                    </Text>
                  </View>
                )}

                {isImageFetching && (
                  <View style={styles.imageRequestFetching}>
                    <SpinningIcon icon={faSpinner} size={18} color="#f59e0b" />
                    <Text style={styles.imageRequestFetchingText}>
                      Processing latest image…
                    </Text>
                  </View>
                )}
              </View>
            )}

            <TouchableOpacity
              style={[styles.imageRequestButton, isImageFetching && styles.imageRequestButtonDisabled]}
              onPress={handleImageRequest}
              disabled={isImageFetching}
            >
              <Text style={styles.imageRequestButtonText}>
                {imageRequestedCount === 0
                  ? 'Request First Image (Free)'
                  : 'Request Image (₹5)'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionTitle}>Transporter</Text>
            <TouchableOpacity style={styles.sosIcon}>
              <FontAwesomeIcon icon={faShieldAlt} size={18} color="red" />
              <Text style={styles.sosText}>SOS</Text>
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
                <FontAwesomeIcon icon={faTimesCircle} size={14} color="#000000" style={styles.statIconMargin} />
                <Text style={styles.statText}>3 Missed</Text>
              </View>
              <View style={styles.transporterIcons}>
                <TouchableOpacity style={[styles.iconButton, styles.iconButtonMarginRight]}>
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
          {order.status === 'ongoing' && editingReceiver ? (
            <>
              <TextInput value={receiverName} onChangeText={setReceiverName} style={styles.input} placeholder="Name" />
              <TextInput value={receiverPhone} onChangeText={setReceiverPhone} style={styles.input} placeholder="Phone" keyboardType="phone-pad" />
              <Picker
                selectedValue={receiverGender}
                style={styles.pickerInput}
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
              {order.status === 'ongoing' && (
                <TouchableOpacity onPress={() => setEditingReceiver(true)} style={styles.editReceiverButton}>
                  <FontAwesomeIcon icon={faUserEdit} size={16} color="#FF5A5F" />
                  <Text style={styles.editReceiverText}>Update Receiver Details</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Shipment Status</Text>
          <View style={styles.shipmentStatusRow}>
            <FontAwesomeIcon icon={faTruck} size={16} color="#3B82F6" style={styles.shipmentStatusIcon} />
            <Text style={styles.infoText}>
            {order.status === 'completed' ? 'Delivered' : 'Out for Delivery'}
            </Text>
          </View>
        </View>

        {order.status === 'ongoing' && (
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
        )}
        {order.status === 'completed' && (
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Payment Details</Text>
                <Text style={styles.infoText}>Amount: ₹{order.amount}</Text>
                <Text style={styles.infoText}>Status: Paid</Text>
                <Text style={styles.infoText}>Paid Date: {order.date}</Text>
            </View>
        )}

        {order.status === 'ongoing' ? (
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
        ) : (
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Shipment Route</Text>
                <View style={styles.routeDetailRow}>
                    <FontAwesomeIcon icon={faMapPin} size={16} color="#3B82F6" />
                    <Text style={styles.routeDetailText}>Source: {sourceLocation}</Text>
                </View>
                <View style={styles.routeDetailRow}>
                    <FontAwesomeIcon icon={faMapPin} size={16} color="#FF5A5F" />
                    <Text style={styles.routeDetailText}>Destination: {destinationLocation}</Text>
                </View>
            </View>
        )}

        {order.status === 'ongoing' && (
            <View style={styles.otpContainer}>
              {!paid ? (
                Platform.OS === 'ios' ? (
                  <BlurView
                    style={styles.blurView}
                    blurType="light"
                    blurAmount={10}
                    reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.7)"
                  >
                    <View style={styles.otpCenter}>
                      <Text style={styles.otpTextMasked}>OTP: *******</Text>
                    </View>
                  </BlurView>
                ) : (
                  <View style={styles.otpCenter}>
                    <Text style={styles.otpTextMasked}>OTP: *******</Text>
                  </View>
                )
              ) : (
                <View style={styles.otpCenter}>
                  <Text style={styles.otpText}>OTP: 647812</Text>
                </View>
              )}
            </View>
        )}

        {(order.status === 'ongoing' && paid) && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.revealOtpButton}>
              <Text style={styles.revealOtpText}>Send OTP to Receiver</Text>
            </TouchableOpacity>
          </View>
        )}
        <CustomAlertModal
          visible={isModalVisible}
          title={modalTitle}
          message={modalMessage}
          buttons={modalButtons}
          onClose={() => setIsModalVisible(false)}
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
  headerRightPlaceholder: { width: 32 },
  backButton: {
    padding: 6,
  },
  orderTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  orderTime: { textAlign: 'center', color: '#666', marginBottom: 16 },

  imageContainer: {
    height: 200,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },

  imageRequestCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  imageRequestTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: 8,
    textAlign: 'center',
  },
  imageRequestSubText: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  imageRequestFreeText: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  imageRequestCostText: {
    color: '#FF5A5F',
    fontWeight: 'bold',
  },
  imageRequestDetailsContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  imageRequestStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 16,
    width: '100%',
  },
  imageRequestStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  imageRequestStatText: {
    fontSize: 14,
    color: '#2d3748',
    marginLeft: 8,
  },
  imageRequestStatBold: {
    fontWeight: '600',
  },
  imageRequestLastRequest: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  imageRequestLastRequestText: {
    fontSize: 14,
    color: '#2d3748',
    marginLeft: 8,
  },
  imageRequestFetching: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  imageRequestFetchingText: {
    fontSize: 14,
    color: '#d97706',
    fontWeight: '500',
    marginLeft: 8,
  },
  imageRequestButton: {
    backgroundColor: '#FF5A5F',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  imageRequestButtonDisabled: {
    opacity: 0.6,
  },
  imageRequestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

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
  sosText: { fontSize: 10, color: 'red', marginTop: 2 },

  rowStart: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  transporterImage: { width: 64, height: 64, borderRadius: 32, marginRight: 12 },
  transporterIcons: { flexDirection: 'row', marginTop: 8 },
  iconButton: {
    backgroundColor: '#fff0f0',
    padding: 15,
    borderRadius: 20,
  },
  iconButtonMarginRight: { marginRight: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ratingText: { marginLeft: 6, color: '#666', fontSize: 12 },
  halfStar: { opacity: 0.5 },
  emptyStar: { opacity: 0.5 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  statText: { fontSize: 12, color: '#555', marginLeft: 4 },
  statIconMargin: { marginLeft: 12 },
  infoTextBold: { color: '#333', fontWeight: '600', fontSize: 14 },
  infoText: { fontSize: 14, color: '#555', marginBottom: 4 },

  editReceiverButton: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  editReceiverText: { marginLeft: 6, color: '#FF5A5F', fontWeight: '500', fontSize: 13 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 10 },
  pickerInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 10, height: 40 },
  saveButton: { backgroundColor: '#16a34a', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: 'white', fontWeight: '600' },

  shipmentStatusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  shipmentStatusIcon: { marginRight: 8 },

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
  routeDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeDetailText: {
    fontSize: 15,
    color: '#555',
    marginLeft: 10,
  },

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
  otpTextMasked: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#555',
    letterSpacing: 4,
  },
  otpText: { fontSize: 24, fontWeight: 'bold', color: '#16a34a', letterSpacing: 4 },
  blurView: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    overflow: 'hidden',
  },
  otpCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
});