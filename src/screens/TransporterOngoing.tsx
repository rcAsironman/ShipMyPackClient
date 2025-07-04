import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    Switch,
    Platform,
    Dimensions,
    Modal,
    ActivityIndicator,
    TextInput,
    Keyboard,
    NativeSyntheticEvent,
    TextInputKeyPressEvent,
    TouchableWithoutFeedback,
    PermissionsAndroid,
    StatusBar,
    SafeAreaView,
    Animated, // Import Animated
    StyleSheet // Import StyleSheet for non-NativeWind styles
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
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
    faStar,
    faCamera,
    faImages,
    faPlayCircle,
    faTimes,
    faHeadset,
    faMapMarkerAlt, // For start/destination icons
    faMoneyBillWave // For earning icon
} from '@fortawesome/free-solid-svg-icons';
import { launchImageLibrary, launchCamera, Asset } from 'react-native-image-picker';
import RNFS from 'react-native-fs';

import OrderDetailsCarousel from '../components/OrderDetailsCarousel';
import CustomAlertModal from '../components/CustomAlertModal';

// --- Type Definitions ---
interface ShipmentOrder {
    id: string;
    date: string;
    time: string;
    amount: number; // Total amount of the order
    shipmentAmount: number; // New: Amount for this specific shipment/task
    startPoint: string; // New: Start point
    destination: string; // New: Destination
    status: 'ongoing' | 'completed';
    initialImages?: string[];
    senderName?: string;
    senderPhone?: string;
    senderGender?: string;
    receiverName?: string;
    receiverPhone?: string;
    receiverGender?: string;
    senderRating?: number; // New: Sender rating
}

interface ShipmentStatus {
    pickedUp: boolean;
    inTransit: boolean;
    delivered: boolean;
}

interface CarouselImageItem {
    uri: string;
}

interface UploadedImageItem {
    originalUri: string;
    displayUri: string;
    fileName: string | null;
    type: 'image' | 'video';
}

type TransporterOrderDetailsRouteProp = RouteProp<
    { TransporterOrderDetails: { order: ShipmentOrder } },
    'TransporterOrderDetails'
>;
// --- End Type Definitions ---

const { height, width } = Dimensions.get('window'); // Get width too for responsive earning popup

// --- Earning Constants ---
const EARNING_OTP_SENDER_ACCESS = 50;
const EARNING_OTP_DELIVERY = 100;
const EARNING_IMAGE_UPLOAD = 25;
const EARNING_STATUS_UPDATE = 30; // For In Transit or other simple status updates

const convertImageUrisToCarouselItems = (uris?: string[]): CarouselImageItem[] => {
    if (!uris) return [];
    return uris.map(uri => ({ uri }));
};

// --- Animated Earning Popup Component ---
interface EarningPopupProps {
    amount: number;
    onAnimationEnd: () => void;
}

const EarningPopup: React.FC<EarningPopupProps> = ({ amount, onAnimationEnd }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity 0
    const translateYAnim = useRef(new Animated.Value(0)).current; // Initial position

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(translateYAnim, {
                toValue: -150, // Move up by 150 units for better visibility
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start(() => {
            // After initial animation, fade out
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500,
                delay: 700, // Stay visible for a bit
                useNativeDriver: true,
            }).start(onAnimationEnd); // Notify parent when animation is complete
        });
    }, [fadeAnim, translateYAnim, onAnimationEnd]);

    return (
        <Animated.View style={[
            styles.earningPopup,
            {
                opacity: fadeAnim,
                transform: [{ translateY: translateYAnim }],
            },
        ]}>
            <FontAwesomeIcon icon={faMoneyBillWave} size={18} color="#28a745" style={{ marginRight: 5 }} />
            <Text style={styles.earningText}>+₹{amount}</Text>
        </Animated.View>
    );
};

export default function TransporterOngoing({ navigation }: { navigation: any }) {
    const route = useRoute<TransporterOrderDetailsRouteProp>();
    // Enhanced mock order data with new fields
    const { order } = route.params || {
        order: {
            id: 'TRN001',
            date: '2023-10-26',
            time: '14:30',
            amount: 1500, // Total order amount (e.g., what customer pays)
            shipmentAmount: 150, // New: Amount specific to this shipment for transporter
            startPoint: 'Hyderabad, Telangana', // New
            destination: 'Bangalore, Karnataka', // New
            status: 'ongoing',
            initialImages: [
                'https://images.unsplash.com/photo-1532635042-a6f6ad4745f9?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                'https://images.unsplash.com/photo-1579726038234-5e608031d75c?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB4uNzVjfDB4MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            ],
            senderName: 'Jane Smith',
            senderPhone: '+91 98765 43210',
            senderGender: 'Female',
            receiverName: 'Rahul Sharma',
            receiverPhone: '+91 87654 32109',
            receiverGender: 'Male',
            senderRating: 4.2, // New: Sender rating
        }
    };

    const [isOtpVerifiedForAccess, setIsOtpVerifiedForAccess] = useState(false);
    const [otpInputVisible, setOtpInputVisible] = useState(false);
    const [otpForDeliveryVisible, setOtpForDeliveryVisible] = useState(false);
    const [currentOtp, setCurrentOtp] = useState<string>('');
    const [isLoadingOtp, setIsLoadingOtp] = useState(false);
    const [otpError, setOtpError] = useState<string | null>(null);

    const otpInputRefs = useRef<(TextInput | null)[]>([]);

    const [senderName] = useState(order.senderName || 'Jane Smith');
    const [senderPhone] = useState(order.senderPhone || '+91 98765 43210');
    const [senderGender] = useState(order.senderGender || 'Female');
    const [senderRating] = useState(order.senderRating || 4.2); // Default if not provided

    const [receiverName] = useState(order.receiverName || 'Rahul Sharma');
    const [receiverPhone] = useState(order.receiverPhone || '+91 87654 32109');
    const [receiverGender] = useState(order.receiverGender || 'Male');

    const [shipmentStatus, setShipmentStatus] = useState<ShipmentStatus>({
        pickedUp: false,
        inTransit: false,
        delivered: false,
    });

    const [pendingStatusChange, setPendingStatusChange] = useState<keyof ShipmentStatus | null>(null);
    const prevShipmentStatusRef = useRef<ShipmentStatus | null>(null);

    const [imageRequestsCount] = useState(2);
    const [uploadedImages, setUploadedImages] = useState<UploadedImageItem[]>([]);
    const [attachmentModalVisible, setAttachmentModalVisible] = useState(false);
    const [pickupAttachmentModalVisible, setPickupAttachmentModalVisible] = useState(false);

    const [fullScreenImageVisible, setFullScreenImageVisible] = useState(false);
    const [currentFullScreenImageUri, setCurrentFullScreenImageUri] = useState<string | null>(null);

    const [customAlertVisible, setCustomAlertVisible] = useState(false);
    const [customAlertTitle, setCustomAlertTitle] = useState('');
    const [customAlertMessage, setCustomAlertMessage] = useState('');
    const [customAlertButtons, setCustomAlertButtons] = useState<{ text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive'; }[]>([]);

    // --- Earning States and Animations ---
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [showEarningPopup, setShowEarningPopup] = useState(false);
    const [earningAmount, setEarningAmount] = useState(0);

    const triggerEarningAnimation = useCallback((amount: number) => {
        setEarningAmount(amount);
        setTotalEarnings(prev => prev + amount);
        setShowEarningPopup(true);
    }, []);

    const handleEarningAnimationEnd = useCallback(() => {
        setShowEarningPopup(false);
        setEarningAmount(0);
    }, []);

    const showCustomAlert = useCallback((title: string, message: string, buttons: { text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive'; }[]) => {
        const isSuccess = title.toLowerCase().includes('success') || title.toLowerCase().includes('confirmed');
        const finalButtons = isSuccess
            ? buttons.filter(button => button.style !== 'cancel' && button.text.toLowerCase() !== 'cancel')
            : [...buttons];

        if (!isSuccess && !buttons.some(button => button.style === 'cancel' || button.text.toLowerCase() === 'cancel')) {
            finalButtons.push({ text: 'Cancel', onPress: () => setCustomAlertVisible(false), style: 'cancel' });
        }

        setCustomAlertTitle(title);
        setCustomAlertMessage(message);
        setCustomAlertButtons(finalButtons);
        setCustomAlertVisible(true);
    }, []);

    const handleOtpChange = (text: string, index: number) => {
        setOtpError(null);
        const otpArray = currentOtp.split('');

        if (text.length === 1) {
            otpArray[index] = text;
            setCurrentOtp(otpArray.join(''));
            if (index < 3) {
                otpInputRefs.current[index + 1]?.focus();
            } else {
                Keyboard.dismiss();
            }
        } else if (text === '') {
            if (index > 0) {
                otpInputRefs.current[index - 1]?.focus();
            }
            otpArray[index] = '';
            setCurrentOtp(otpArray.join(''));
        }

        const updatedOtp = otpArray.join('');
        if (updatedOtp.length === 4 && !updatedOtp.includes('')) {
            if (otpInputVisible) {
                handleAccessOtpVerification();
            } else if (otpForDeliveryVisible) {
                handleDeliveryOtpVerification();
            }
        }
    };

    const handleOtpKeyPress = (
        e: NativeSyntheticEvent<TextInputKeyPressEvent>,
        index: number
    ) => {
        if (e.nativeEvent.key === 'Backspace' && currentOtp[index] === '' && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
            const otpArray = currentOtp.split('');
            otpArray[index - 1] = '';
            setCurrentOtp(otpArray.join(''));
        }
    };

    const requestCameraAndStoragePermissions = useCallback(async (): Promise<boolean> => {
        if (Platform.OS === 'android') {
            try {
                const permissions = [
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    ...(Number(Platform.Version) >= 33
                        ? [
                            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
                        ]
                        : [PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE]),
                ];

                const grantedResults = await PermissionsAndroid.requestMultiple(permissions);

                const cameraGranted = grantedResults[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED;
                const storageGranted =
                    (Number(Platform.Version) >= 33
                        ? (grantedResults[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] === PermissionsAndroid.RESULTS.GRANTED &&
                            grantedResults[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] === PermissionsAndroid.RESULTS.GRANTED)
                        : (grantedResults[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED));

                if (cameraGranted && storageGranted) {
                    console.log('Camera and Storage permissions granted');
                    return true;
                } else {
                    console.log('Permissions denied');
                    showCustomAlert(
                        'Permissions Required',
                        'Camera and Storage permissions are needed to take and upload photos/videos. Please enable them in settings.',
                        [{ text: 'OK', onPress: () => { } }]
                    );
                    return false;
                }
            } catch (err) {
                console.warn('Permission request error:', err);
                showCustomAlert('Permission Error', 'An error occurred while requesting permissions.', [{ text: 'OK', onPress: () => { } }]);
                return false;
            }
        }
        return true;
    }, [showCustomAlert]);

    const renderStars = (rating: number) => {
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
    };

    const handleAccessOtpVerification = async () => {
        setOtpError(null);
        if (currentOtp.length !== 4) {
            setOtpError('Please enter the 4-digit OTP.');
            return;
        }

        setIsLoadingOtp(true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (currentOtp === '1234') { // Mock OTP for sender access
            setIsOtpVerifiedForAccess(true);
            setOtpInputVisible(false); // Hide the OTP modal
            setCurrentOtp(''); // Clear OTP
            triggerEarningAnimation(EARNING_OTP_SENDER_ACCESS); // Trigger earning animation
            showCustomAlert('Success', `Order details unlocked! You earned ₹${EARNING_OTP_SENDER_ACCESS}.`, [{ text: 'OK', onPress: () => { } }]);
        } else {
            setOtpError('The OTP you entered is incorrect. Please try again.');
        }
        setIsLoadingOtp(false);
    };

    const handleDeliveryOtpVerification = async () => {
        setOtpError(null);
        if (currentOtp.length !== 4) {
            setOtpError('Please enter the 4-digit OTP.');
            return;
        }

        setIsLoadingOtp(true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (currentOtp === '5678') { // Mock OTP for delivery confirmation
            setShipmentStatus(prev => ({ ...prev, delivered: true })); // Confirm delivery status
            setOtpForDeliveryVisible(false); // Hide the OTP modal
            setCurrentOtp(''); // Clear OTP
            setPendingStatusChange(null); // Clear pending status
            triggerEarningAnimation(EARNING_OTP_DELIVERY); // Trigger earning animation

            showCustomAlert(
                'Delivery Confirmed!',
                `The shipment has been successfully marked as delivered. You earned ₹${EARNING_OTP_DELIVERY}. You will now be redirected to the completed orders.`,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            navigation.replace('TransporterCompleted', { order: { ...order, status: 'completed' } });
                        }
                    }
                ]
            );

        } else {
            setOtpError('The OTP you entered is incorrect. Please try again.');
        }
        setIsLoadingOtp(false);
    };

    const handleStatusChange = (statusKey: keyof ShipmentStatus, value: boolean) => {
        if (value === false) { // Logic for preventing turning switches OFF manually
            showCustomAlert('Cannot Undo', 'Shipment status cannot be reverted once confirmed.', [{ text: 'OK', onPress: () => { } }]);
            return;
        }

        // If trying to turn ON a switch that's already ON, do nothing
        if (shipmentStatus[statusKey]) {
            return;
        }

        // Store the current state before attempting a change that might be canceled
        prevShipmentStatusRef.current = { ...shipmentStatus };
        setPendingStatusChange(statusKey); // Set the status key that is pending confirmation

        if (statusKey === 'pickedUp') {
            // This will show the attachment modal, which then sets the status on success
            setPickupAttachmentModalVisible(true);
        } else if (statusKey === 'inTransit') {
            if (shipmentStatus.pickedUp) {
                showCustomAlert(
                    'Confirm "In Transit"',
                    'Are you sure you want to mark the shipment as "In Transit"? This cannot be undone.',
                    [
                        {
                            text: 'Confirm',
                            onPress: () => {
                                setShipmentStatus(prev => ({ ...prev, inTransit: true }));
                                setPendingStatusChange(null); // Clear pending status
                                triggerEarningAnimation(EARNING_STATUS_UPDATE); // Earning for status update
                                showCustomAlert('Status Updated', `Shipment is now marked as "In Transit". You earned ₹${EARNING_STATUS_UPDATE}.`, [{ text: 'OK', onPress: () => { } }]);
                            }
                        },
                        {
                            text: 'Cancel',
                            onPress: () => {
                                setCustomAlertVisible(false);
                                setPendingStatusChange(null); // Clear pending status
                                // No state update, it will revert visually
                            },
                            style: 'cancel'
                        }
                    ]
                );
            } else {
                setPendingStatusChange(null); // Clear pending status as action not allowed
                showCustomAlert('Action Required', 'Please confirm "Picked Up" status first.', [{ text: 'OK', onPress: () => { } }]);
            }
        } else if (statusKey === 'delivered') {
            if (shipmentStatus.inTransit) {
                setOtpForDeliveryVisible(true);
                setCurrentOtp('');
                setOtpError(null);
                setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
            } else {
                setPendingStatusChange(null); // Clear pending status as action not allowed
                showCustomAlert('Action Required', 'Please confirm "In Transit" status first.', [{ text: 'OK', onPress: () => { } }]);
            }
        }
    };

    const resolveUriForDisplay = async (originalUri: string, fileName: string | null = null): Promise<string> => {
        if (!originalUri) {
            console.warn("[resolveUriForDisplay] Provided URI is null or empty.");
            return '';
        }

        if (Platform.OS === 'ios' || originalUri.startsWith('file://')) {
            return originalUri;
        }

        if (originalUri.startsWith('content://')) {
            try {
                const extension = (fileName?.split('.').pop() || originalUri.split('.').pop() || 'jpg').toLowerCase();
                const baseName = fileName ? fileName.split('.').slice(0, -1).join('.') : `temp_file`;
                const newFileName = `${baseName}_${Date.now()}.${extension}`;
                const destinationPath = `${RNFS.CachesDirectoryPath}/${newFileName}`;

                await RNFS.copyFile(originalUri, destinationPath);
                const fileUri = `file://${destinationPath}`;
                return fileUri;
            } catch (copyError) {
                console.error('[resolveUriForDisplay] Failed to copy content URI to file path:', copyError);
                showCustomAlert('File Error', 'Could not prepare the selected file for display. Please try again.', [{ text: 'OK', onPress: () => { } }]);
                return originalUri;
            }
        }
        return originalUri;
    };

    const addProcessedMedia = useCallback(async (asset: Asset, context?: 'pickup') => {
        if (!asset.uri) {
            console.warn('Asset URI is null, skipping processing.');
            return;
        }

        const type: 'image' | 'video' = asset.type?.startsWith('video') ? 'video' : 'image';
        const displayUri = await resolveUriForDisplay(asset.uri, asset.fileName || null);

        const newItem: UploadedImageItem = {
            originalUri: asset.uri,
            displayUri: displayUri,
            fileName: asset.fileName || null,
            type: type,
        };

        setUploadedImages(prevImages => [...prevImages, newItem]);
        triggerEarningAnimation(EARNING_IMAGE_UPLOAD); // Earning for image upload
        showCustomAlert('Upload Successful', `Photo uploaded successfully. You earned ₹${EARNING_IMAGE_UPLOAD}.`, [{ text: 'OK', onPress: () => { } }]);

        if (context === 'pickup' && pendingStatusChange === 'pickedUp') {
            setShipmentStatus(prev => ({ ...prev, pickedUp: true }));
            setPendingStatusChange(null); // Clear pending status
        }
    }, [addProcessedMedia, pendingStatusChange, showCustomAlert, triggerEarningAnimation]);

    const handleTakePhoto = useCallback(async (context?: 'pickup') => {
        setAttachmentModalVisible(false);
        setPickupAttachmentModalVisible(false);
        setCustomAlertVisible(false);

        const hasPermission = await requestCameraAndStoragePermissions();
        if (!hasPermission) return;

        setTimeout(async () => {
            try {
                const result = await launchCamera({
                    mediaType: 'photo',
                    quality: 0.7,
                    includeBase64: false,
                    saveToPhotos: true,
                    maxWidth: 1024,
                    maxHeight: 768,
                });

                if (result.didCancel) {
                    console.log('User cancelled camera operation.');
                    if (context === 'pickup' && pendingStatusChange === 'pickedUp') {
                        setShipmentStatus(prevShipmentStatusRef.current || shipmentStatus);
                    }
                    setPendingStatusChange(null);
                    return;
                }
                if (result.errorCode) {
                    showCustomAlert('Camera Error', `Could not take photo: ${result.errorMessage || result.errorCode}`, [{ text: 'OK', onPress: () => { } }]);
                    if (context === 'pickup' && pendingStatusChange === 'pickedUp') {
                        setShipmentStatus(prevShipmentStatusRef.current || shipmentStatus);
                    }
                    setPendingStatusChange(null);
                    return;
                }

                if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
                    await addProcessedMedia(result.assets[0], context);
                } else {
                    showCustomAlert('Error', 'No asset URI found after taking photo.', [{ text: 'OK', onPress: () => { } }]);
                    if (context === 'pickup' && pendingStatusChange === 'pickedUp') {
                        setShipmentStatus(prevShipmentStatusRef.current || shipmentStatus);
                    }
                    setPendingStatusChange(null);
                }
            } catch (error: any) {
                console.error('General Camera error:', error);
                showCustomAlert('Error', `An unexpected error occurred while accessing the camera: ${error.message || 'Unknown error'}`, [{ text: 'OK', onPress: () => { } }]);
                if (context === 'pickup' && pendingStatusChange === 'pickedUp') {
                    setShipmentStatus(prevShipmentStatusRef.current || shipmentStatus);
                }
                setPendingStatusChange(null);
            }
        }, 300);
    }, [addProcessedMedia, requestCameraAndStoragePermissions, showCustomAlert, pendingStatusChange, shipmentStatus]);

    const handleChooseFromLibrary = useCallback(async (context?: 'pickup') => {
        setAttachmentModalVisible(false);
        setPickupAttachmentModalVisible(false);
        setCustomAlertVisible(false);

        const hasPermission = await requestCameraAndStoragePermissions();
        if (!hasPermission) return;

        setTimeout(async () => {
            try {
                const result = await launchImageLibrary({
                    mediaType: 'photo',
                    selectionLimit: 1,
                    quality: 0.7,
                    includeBase64: false,
                    maxWidth: 1024,
                    maxHeight: 768,
                });

                if (result.didCancel) {
                    console.log('User cancelled image picker.');
                    if (context === 'pickup' && pendingStatusChange === 'pickedUp') {
                        setShipmentStatus(prevShipmentStatusRef.current || shipmentStatus);
                    }
                    setPendingStatusChange(null);
                    return;
                }
                if (result.errorCode) {
                    showCustomAlert('Library Error', `Could not pick from library: ${result.errorMessage || result.errorCode}`, [{ text: 'OK', onPress: () => { } }]);
                    if (context === 'pickup' && pendingStatusChange === 'pickedUp') {
                        setShipmentStatus(prevShipmentStatusRef.current || shipmentStatus);
                    }
                    setPendingStatusChange(null);
                    return;
                }

                if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
                    await addProcessedMedia(result.assets[0], context);
                } else {
                    showCustomAlert('Error', 'No asset URI found after picking from library.', [{ text: 'OK', onPress: () => { } }]);
                    if (context === 'pickup' && pendingStatusChange === 'pickedUp') {
                        setShipmentStatus(prevShipmentStatusRef.current || shipmentStatus);
                    }
                    setPendingStatusChange(null);
                }
            } catch (error: any) {
                console.error('General Media picker error:', error);
                showCustomAlert('Error', `An unexpected error occurred while picking from library: ${error.message || 'Unknown error'}`, [{ text: 'OK', onPress: () => { } }]);
                if (context === 'pickup' && pendingStatusChange === 'pickedUp') {
                    setShipmentStatus(prevShipmentStatusRef.current || shipmentStatus);
                }
                setPendingStatusChange(null);
            }
        }, 300);
    }, [addProcessedMedia, requestCameraAndStoragePermissions, showCustomAlert, pendingStatusChange, shipmentStatus]);

    const handleImageUploadButton = () => {
        setAttachmentModalVisible(true);
    };

    const openFullScreenImage = (uri: string) => {
        setCurrentFullScreenImageUri(uri);
        setFullScreenImageVisible(true);
    };

    const closeFullScreenImage = () => {
        setFullScreenImageVisible(false);
        setCurrentFullScreenImageUri(null);
    };

    const otpInputFocusAnim = useRef(Array(4).fill(0).map(() => new Animated.Value(0))).current;

    const handleOtpFocus = (index: number) => {
        Animated.timing(otpInputFocusAnim[index], {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    const handleOtpBlur = (index: number) => {
        Animated.timing(otpInputFocusAnim[index], {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    const renderOtpInputs = () => {
        const inputs = [];
        for (let i = 0; i < 4; i++) {
            const borderColor = otpInputFocusAnim[i].interpolate({
                inputRange: [0, 1],
                outputRange: ['#d1d5db', '#FF5A5F'], // gray-300 to red-500
            });
            const scale = otpInputFocusAnim[i].interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.05],
            });

            inputs.push(
                <Animated.View
                    key={i}
                    style={{
                        width: 50,
                        height: 50,
                        borderWidth: 2,
                        borderRadius: 12,
                        backgroundColor: '#f9fafb', // bg-gray-50
                        borderColor: otpError ? 'red' : borderColor,
                        transform: [{ scale }],
                    }}
                >
                    <TextInput
                        ref={(el: TextInput | null) => { otpInputRefs.current[i] = el; }}
                        style={styles.otpInputText}
                        keyboardType="numeric"
                        maxLength={1}
                        onChangeText={text => handleOtpChange(text, i)}
                        onKeyPress={e => handleOtpKeyPress(e, i)}
                        value={currentOtp[i] || ''}
                        blurOnSubmit={false}
                        caretHidden={false}
                        selectTextOnFocus={true}
                        onFocus={() => handleOtpFocus(i)}
                        onBlur={() => handleOtpBlur(i)}
                    />
                </Animated.View>
            );
        }
        return (
            <View className="flex-row justify-between w-4/5 mb-5">
                {inputs}
            </View>
        );
    };

    const handleCancelOtpModal = useCallback(() => {
        setOtpInputVisible(false);
        setOtpForDeliveryVisible(false);
        setCurrentOtp('');
        setOtpError(null);
        setIsLoadingOtp(false);

        if (pendingStatusChange === 'delivered' && prevShipmentStatusRef.current) {
            setShipmentStatus(prevShipmentStatusRef.current);
        }
        setPendingStatusChange(null);
    }, [pendingStatusChange]);

    const handleCancelPickupAttachmentModal = useCallback(() => {
        setPickupAttachmentModalVisible(false);
        if (pendingStatusChange === 'pickedUp' && prevShipmentStatusRef.current) {
            setShipmentStatus(prevShipmentStatusRef.current);
        }
        setPendingStatusChange(null);
    }, [pendingStatusChange]);

    const handleGoBack = useCallback(() => {
        if (otpInputVisible || otpForDeliveryVisible) {
            handleCancelOtpModal();
        } else if (pickupAttachmentModalVisible) {
            handleCancelPickupAttachmentModal();
        } else if (customAlertVisible && pendingStatusChange === 'inTransit') {
            setCustomAlertVisible(false);
            setPendingStatusChange(null);
            setShipmentStatus(prevShipmentStatusRef.current || shipmentStatus);
        }
        else {
            navigation.goBack();
        }
    }, [navigation, otpInputVisible, otpForDeliveryVisible, pickupAttachmentModalVisible, customAlertVisible, pendingStatusChange, handleCancelOtpModal, handleCancelPickupAttachmentModal, shipmentStatus]);


    useEffect(() => {
        if (order.status === 'ongoing' && !isOtpVerifiedForAccess) {
            setOtpInputVisible(true);
            setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
        } else {
            setOtpInputVisible(false);
        }
    }, [order.status, isOtpVerifiedForAccess]);

    // isFullScreenModalVisible should only be true for modals that take over the screen
    const isFullScreenModalVisible = otpInputVisible || otpForDeliveryVisible || fullScreenImageVisible || customAlertVisible || attachmentModalVisible || pickupAttachmentModalVisible;

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar backgroundColor="white" barStyle="dark-content" />

            {/* Earning Popup Overlay - Rendered universally so it's on top of modals */}
            {showEarningPopup && (
                <View style={StyleSheet.absoluteFillObject} pointerEvents="none" className="z-[9999]">
                    <EarningPopup amount={earningAmount} onAnimationEnd={handleEarningAnimationEnd} />
                </View>
            )}

            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
                <TouchableOpacity onPress={handleGoBack} className="p-1">
                    <FontAwesomeIcon icon={faArrowLeft} size={20} color="#333" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-neutral-800">Order #{order.id}</Text>
                <TouchableOpacity onPress={() => console.log('Support Pressed')} className="p-1">
                    <FontAwesomeIcon icon={faHeadset} size={20} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Total Earnings Display - Fixed at the bottom for constant visibility */}
            <View style={styles.totalEarningsContainer}>
                <FontAwesomeIcon icon={faMoneyBillWave} size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text className="text-white text-lg font-extrabold">Total Earnings: ₹{totalEarnings}</Text>
            </View>


            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}> {/* Add padding for the fixed earnings bar */}
                <Text className="text-sm text-neutral-600 text-center py-2 bg-gray-100">
                    Created on {order.date}, {order.time}
                </Text>

                {order.initialImages && order.initialImages.length > 0 ? (
                    <View style={{ height: height * 0.3 }} className="w-full mt-2">
                        <OrderDetailsCarousel images={convertImageUrisToCarouselItems(order.initialImages)} />
                    </View>
                ) : (
                    <View style={{ height: height * 0.3 }} className="w-full mt-2 justify-center items-center">
                        <Text className="text-base text-neutral-600 p-5 text-center">No images available for this order.</Text>
                    </View>
                )}

                {/* Travel Details Section */}
                <View className="bg-white rounded-lg mx-4 mt-4 p-4 shadow-md">
                    <Text className="text-base font-bold text-neutral-800 mb-3">Travel Details</Text>
                    <View className="flex-row items-center mb-2">
                        <FontAwesomeIcon icon={faMapMarkerAlt} size={16} color="#FF5A5F" style={{ marginRight: 10 }} />
                        <Text className="text-sm text-neutral-600">
                            <Text className="font-semibold">From:</Text> {order.startPoint}
                        </Text>
                    </View>
                    <View className="flex-row items-center mb-2">
                        <FontAwesomeIcon icon={faMapMarkerAlt} size={16} color="#28a745" style={{ marginRight: 10 }} />
                        <Text className="text-sm text-neutral-600">
                            <Text className="font-semibold">To:</Text> {order.destination}
                        </Text>
                    </View>
                    <View className="flex-row items-center mt-3 pt-3 border-t border-gray-200">
                        <FontAwesomeIcon icon={faMoneyBillWave} size={16} color="#333" style={{ marginRight: 10 }} />
                        <Text className="text-base font-bold text-neutral-800">
                            Shipment Amount: ₹{order.shipmentAmount}
                        </Text>
                    </View>
                </View>

                {/* Requested Images Upload Section */}
                <View className="bg-white rounded-lg mx-4 mt-4 p-4 shadow-md">
                    <Text className="text-base font-bold text-neutral-800 mb-2">Task: Upload Item Images</Text>
                    <Text className="text-sm text-neutral-600 mb-2">
                        You have <Text className="font-bold">{imageRequestsCount} pending requests</Text> for images from the sender. Please upload them here.
                    </Text>
                    <TouchableOpacity
                        className="bg-red-500 flex-row items-center justify-center py-3 rounded-lg mt-4"
                        onPress={handleImageUploadButton}
                    >
                        <FontAwesomeIcon icon={faUpload} size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text className="text-white text-base font-bold">Upload Image</Text>
                    </TouchableOpacity>

                    {uploadedImages.length > 0 && (
                        <View className="mt-5">
                            <Text className="text-base font-bold text-neutral-800 mb-3">Images Sent by You:</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-1">
                                {uploadedImages.map((item, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        className="rounded-lg overflow-hidden border border-gray-200"
                                        style={{ marginRight: 12 }} // Adjusted margin here
                                        onPress={() => openFullScreenImage(item.displayUri)}
                                    >
                                        <Image
                                            source={{ uri: item.displayUri }}
                                            className="w-24 h-24 rounded-lg"
                                            resizeMode="cover"
                                            onError={(e) => console.error('Uploaded media load error:', e.nativeEvent.error, 'URI:', item.displayUri)}
                                        />
                                        {item.type === 'video' && (
                                            <View className="absolute inset-0 bg-black/40 justify-center items-center rounded-lg">
                                                <FontAwesomeIcon icon={faPlayCircle} size={24} color="#fff" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>

                {/* Sender Details - Now with Rating & Contact Icons */}
                <View className="bg-white rounded-lg mx-4 mt-4 p-4 shadow-md">
                    <Text className="text-base font-bold text-neutral-800 mb-2">Sender Details</Text>
                    <View className="flex-row items-start">
                        {/* Placeholder image for sender */}
                        <Image
                            source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }}
                            className="w-16 h-16 rounded-full mr-4 border border-gray-200"
                        />
                        <View>
                            <Text className="text-base font-semibold text-neutral-800">
                                {senderName}
                            </Text>
                            <Text className="text-sm text-neutral-600">
                                Phone: {senderPhone}
                            </Text>
                            <View className="flex-row items-center mb-1">
                                {renderStars(senderRating)}
                                <Text className="text-xs text-neutral-600 ml-1">{senderRating.toFixed(1)}</Text>
                            </View>
                            <View className="flex-row mt-1">
                                <TouchableOpacity
                                    className="bg-red-100 p-2 rounded-full"
                                    style={{ marginRight: 12 }} // Added margin here
                                    disabled={!isOtpVerifiedForAccess}
                                >
                                    <FontAwesomeIcon icon={faComments} size={20} color={isOtpVerifiedForAccess ? "#FF5A5F" : "#CCC"} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="bg-red-100 p-2 rounded-full"
                                    disabled={!isOtpVerifiedForAccess}
                                >
                                    <FontAwesomeIcon icon={faPhone} size={20} color={isOtpVerifiedForAccess ? "#FF5A5F" : "#CCC"} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Receiver Details - Always Visible */}
                <View className="bg-white rounded-lg mx-4 mt-4 p-4 shadow-md">
                    <Text className="text-base font-bold text-neutral-800 mb-2">Receiver Details</Text>
                    <Text className="text-sm text-neutral-600 mb-1">Name: {receiverName}</Text>
                    <Text className="text-sm text-neutral-600 mb-1">Phone: {receiverPhone}</Text>
                    <Text className="text-sm text-neutral-600">Gender: {receiverGender}</Text>
                </View>

                {/* Update Shipment Status */}
                <View className="bg-white rounded-lg mx-4 mt-4 p-4 shadow-md mb-4">
                    <Text className="text-base font-bold text-neutral-800 mb-2">Task: Update Shipment Status</Text>
                    <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
                        <View className="flex-row items-center">
                            <FontAwesomeIcon icon={faBoxOpen} size={16} color="#3B82F6" style={{ marginRight: 8 }} />
                            <View>
                                <Text className="text-sm text-neutral-600">Picked Up</Text>
                                {!shipmentStatus.pickedUp && (
                                    <Text className="text-xs text-blue-500 mt-1 font-medium">
                                        Tap to upload pickup photo and confirm.
                                    </Text>
                                )}
                            </View>
                        </View>
                        <Switch
                            value={shipmentStatus.pickedUp}
                            onValueChange={(value) => handleStatusChange('pickedUp', value)}
                            thumbColor={shipmentStatus.pickedUp ? '#4CAF50' : (Platform.OS === 'android' ? '#f4f3f4' : '#E9E9EA')}
                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                            disabled={shipmentStatus.pickedUp}
                        />
                    </View>
                    <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
                        <View className="flex-row items-center">
                            <FontAwesomeIcon icon={faTruck} size={16} color="#FFA500" style={{ marginRight: 8 }} />
                            <Text className="text-sm text-neutral-600">In Transit</Text>
                        </View>
                        <Switch
                            value={shipmentStatus.inTransit}
                            onValueChange={(value) => handleStatusChange('inTransit', value)}
                            thumbColor={shipmentStatus.inTransit ? '#FFA500' : (Platform.OS === 'android' ? '#f4f3f4' : '#E9E9EA')}
                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                            disabled={shipmentStatus.inTransit || !shipmentStatus.pickedUp}
                        />
                    </View>
                    <View className="flex-row justify-between items-center py-2">
                        <View className="flex-row items-center">
                            <FontAwesomeIcon icon={faCheckCircle} size={16} color="#16a34a" style={{ marginRight: 8 }} />
                            <Text className="text-sm text-neutral-600">Delivered</Text>
                        </View>
                        <Switch
                            value={shipmentStatus.delivered}
                            onValueChange={(value) => handleStatusChange('delivered', value)}
                            thumbColor={shipmentStatus.delivered ? '#007BFF' : (Platform.OS === 'android' ? '#f4f3f4' : '#E9E9EA')}
                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                            disabled={shipmentStatus.delivered || !shipmentStatus.inTransit}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Conditional OTP Modal */}
            {(otpInputVisible && !isOtpVerifiedForAccess) || otpForDeliveryVisible ? (
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={true}
                    onRequestClose={handleCancelOtpModal}
                >
                    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                        <View className="absolute inset-0 justify-center items-center bg-black/95">
                            <TouchableWithoutFeedback>
                                <ScrollView
                                    style={{ maxHeight: height * 0.7 }}
                                    contentContainerStyle={{ justifyContent: 'center', alignItems: 'center', padding: 20, minHeight: height * 0.3 }}
                                    className="w-[90%] rounded-2xl bg-white"
                                    keyboardShouldPersistTaps="handled"
                                >
                                    <View className="w-full items-center">
                                        <Text className="text-xl font-bold text-neutral-800 mb-2">
                                            {otpInputVisible ? 'Enter Sender OTP' : 'Enter Delivery OTP'}
                                        </Text>
                                        <Text className="text-sm text-neutral-600 text-center mb-5 leading-tight">
                                            A 4-digit OTP has been sent to the {otpInputVisible ? 'sender' : 'receiver'}'s phone number.
                                        </Text>
                                        {renderOtpInputs()}
                                        {isLoadingOtp ? (
                                            <ActivityIndicator size="small" color="#FF5A5F" style={{ marginTop: 12 }} />
                                        ) : (
                                            otpError && <Text className="text-red-500 text-sm text-center" style={{ marginTop: 12 }}>{otpError}</Text>
                                        )}
                                        <TouchableOpacity
                                            className="bg-red-500 py-3.5 rounded-lg w-4/5 items-center"
                                            style={{ marginTop: 20 }}
                                            onPress={otpInputVisible ? handleAccessOtpVerification : handleDeliveryOtpVerification}
                                            disabled={isLoadingOtp || currentOtp.length !== 4}
                                        >
                                            <Text className="text-white text-base font-bold">Verify OTP</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            className="py-2"
                                            style={{ marginTop: 16 }}
                                            onPress={handleCancelOtpModal}
                                        >
                                            <Text className="text-neutral-600 text-base">Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                                </ScrollView>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            ) : null}

            {/* General Attachment Options Modal (for 'Upload Image' button) */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={attachmentModalVisible}
                onRequestClose={() => setAttachmentModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setAttachmentModalVisible(false)}>
                    <View className="flex-1 justify-end bg-black/70">
                        <TouchableWithoutFeedback>
                            <View className="bg-white w-full p-5 rounded-t-2xl items-center pb-8 shadow-lg">
                                <Text className="text-lg font-bold text-neutral-800 mb-4">Upload Photo/Video</Text>
                                <TouchableOpacity
                                    className="flex-row items-center bg-gray-100 py-4 rounded-lg w-[90%] justify-center mb-2.5"
                                    onPress={() => handleTakePhoto()}
                                >
                                    <FontAwesomeIcon icon={faCamera} size={22} color="#FF5A5F" style={{ marginRight: 8 }} />
                                    <Text className="text-neutral-800 text-lg font-semibold">Take Photo</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="flex-row items-center bg-gray-100 py-4 rounded-lg w-[90%] justify-center mb-2.5"
                                    onPress={() => handleChooseFromLibrary()}
                                >
                                    <FontAwesomeIcon icon={faImages} size={22} color="#FF5A5F" style={{ marginRight: 8 }} />
                                    <Text className="text-neutral-800 text-lg font-semibold">Choose from Library</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="flex-row items-center bg-gray-200 py-4 rounded-lg w-[90%] justify-center"
                                    style={{ marginTop: 8 }}
                                    onPress={() => setAttachmentModalVisible(false)}
                                >
                                    <FontAwesomeIcon icon={faTimes} size={22} color="#333" style={{ marginRight: 8 }} />
                                    <Text className="text-neutral-800 text-lg font-semibold">Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Pickup Attachment Options Modal (for 'Picked Up' toggle) */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={pickupAttachmentModalVisible}
                onRequestClose={handleCancelPickupAttachmentModal}
            >
                <TouchableWithoutFeedback onPress={handleCancelPickupAttachmentModal}>
                    <View className="flex-1 justify-end bg-black/70">
                        <TouchableWithoutFeedback>
                            <View className="bg-white w-full p-5 rounded-t-2xl items-center pb-8 shadow-lg">
                                <Text className="text-lg font-bold text-neutral-800 mb-4 text-center">
                                    Upload Pickup Photo to Confirm
                                </Text>
                                <TouchableOpacity
                                    className="flex-row items-center bg-red-100 py-4 rounded-lg w-[90%] justify-center mb-2.5 border border-red-500"
                                    onPress={() => handleTakePhoto('pickup')}
                                >
                                    <FontAwesomeIcon icon={faCamera} size={22} color="#FF5A5F" style={{ marginRight: 8 }} />
                                    <Text className="text-red-600 text-lg font-semibold">Take Photo</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="flex-row items-center bg-red-100 py-4 rounded-lg w-[90%] justify-center mb-2.5 border border-red-500"
                                    onPress={() => handleChooseFromLibrary('pickup')}
                                >
                                    <FontAwesomeIcon icon={faImages} size={22} color="#FF5A5F" style={{ marginRight: 8 }} />
                                    <Text className="text-red-600 text-lg font-semibold">Choose from Library</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="flex-row items-center bg-gray-200 py-4 rounded-lg w-[90%] justify-center"
                                    style={{ marginTop: 8 }}
                                    onPress={handleCancelPickupAttachmentModal}
                                >
                                    <FontAwesomeIcon icon={faTimes} size={22} color="#333" style={{ marginRight: 8 }} />
                                    <Text className="text-neutral-800 text-lg font-semibold">Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Full-Screen Image Preview Modal */}
            <Modal
                visible={fullScreenImageVisible}
                transparent={true}
                onRequestClose={closeFullScreenImage}
            >
                <View className="flex-1 bg-black/90 justify-center items-center">
                    {currentFullScreenImageUri && (
                        <Image
                            source={{ uri: currentFullScreenImageUri }}
                            className="w-[95%] h-[80%]"
                            resizeMode="contain"
                        />
                    )}
                    <TouchableOpacity onPress={closeFullScreenImage} className="absolute top-12 right-5 p-2.5">
                        <FontAwesomeIcon icon={faTimes} size={30} color="#fff" />
                    </TouchableOpacity>
                </View>
            </Modal>

            {/* Custom Alert Modal */}
            <CustomAlertModal
                visible={customAlertVisible}
                title={customAlertTitle}
                message={customAlertMessage}
                buttons={customAlertButtons}
                onClose={() => setCustomAlertVisible(false)}
            />
        </SafeAreaView>
    );
}

// Separate StyleSheet for consistent non-NativeWind styles
const styles = StyleSheet.create({
    otpInputText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#262626', // neutral-800
        padding: 0, // Remove default padding from TextInput
    },
    earningPopup: {
        position: 'absolute',
        top: '25%', // Adjust as needed, will be animated upwards
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 9999, // Ensure it's on top of all other regular content and most modals
        minWidth: 120, // Give it a minimum width
        justifyContent: 'center',
    },
    earningText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#28a745', // Green color for earnings
    },
    totalEarningsContainer: {
        position: 'absolute',
        bottom: 0, // Fixed at the bottom
        left: 0,
        right: 0,
        backgroundColor: '#FF5A5F', // A strong, noticeable color
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 }, // Shadow upwards
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 10, // Ensure it's above scroll content
        zIndex: 1000, // Make sure it's above scroll content but below the earning popup
    }
});