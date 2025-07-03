import React, { useState, useRef } from 'react';
import {
    View,
    Text, // Ensure Text is imported
    ScrollView,
    TouchableOpacity,
    Image,
    Switch,
    Platform,
    Dimensions,
    Modal,
    ActivityIndicator,
    TextInput,
    SafeAreaView,
    StyleSheet,
    Alert,
    StatusBar,
    PermissionsAndroid,
    Keyboard,
    NativeSyntheticEvent,
    TextInputKeyPressEvent,
    TouchableWithoutFeedback,
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
    faLock,
    faCamera,
    faImages,
    faPlayCircle,
    faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { launchImageLibrary, launchCamera, Asset } from 'react-native-image-picker';
import RNFS from 'react-native-fs';

import OrderDetailsCarousel from './OrderDetailsCarousel'; // Assuming this component exists and is correctly implemented

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

const { width, height } = Dimensions.get('window');

const convertImageUrisToCarouselItems = (uris?: string[]): CarouselImageItem[] => {
    if (!uris) return [];
    return uris.map(uri => ({ uri }));
};


export default function TransporterOrderDetailsScreen({ navigation }: { navigation: any }) {
    const route = useRoute<TransporterOrderDetailsRouteProp>();
    const { order } = route.params || {
        order: {
            id: 'TRN001',
            date: '2023-10-26',
            time: '14:30',
            amount: 1500,
            status: 'ongoing',
            initialImages: [
                'https://images.unsplash.com/photo-1532635042-a6f6ad4745f9?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                'https://images.unsplash.com/photo-1579726038234-5e608031d75c?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB4uNzVjfDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                'https://images.unsplash.com/photo-1628126135835-f09459345c26?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1pYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            ],
            senderName: 'Jane Smith',
            senderPhone: '+91 98765 43210',
            senderGender: 'Female',
        }
    };


    const transporterRating = 3.5;
    const [isOtpVerifiedForAccess, setIsOtpVerifiedForAccess] = useState(false);
    // Initialize to TRUE so the OTP modal shows immediately on screen load
    const [otpInputVisible, setOtpInputVisible] = useState(true);
    const [otpForDeliveryVisible, setOtpForDeliveryVisible] = useState(false);
    const [currentOtp, setCurrentOtp] = useState<string>('');
    const [isLoadingOtp, setIsLoadingOtp] = useState(false);
    const [otpError, setOtpError] = useState<string | null>(null);
    // Removed isNavigatingBack state


    // Array of refs for each OTP input
    const otpInputRefs = useRef<(TextInput | null)[]>([]);

    const [senderName] = useState(order.senderName || 'Jane Smith');
    const [senderPhone] = useState(order.senderPhone || '+91 98765 43210');
    const [senderGender] = useState('Female');

    // Transporter details - these will be conditionally shown/obscured
    const [transporterName] = useState('John Doe');
    const [transporterPhone] = useState('+91 99887 76655');


    const [receiverName] = useState('Rahul Sharma');
    const [receiverPhone] = useState('+91 87654 32109');
    const [receiverGender] = useState('Male');

    const [shipmentStatus, setShipmentStatus] = useState<ShipmentStatus>({
        pickedUp: order.status === 'ongoing' || order.status === 'completed',
        inTransit: order.status === 'completed',
        delivered: order.status === 'completed',
    });

    const [imageRequestsCount] = useState(2);
    const [uploadedImages, setUploadedImages] = useState<UploadedImageItem[]>([]);
    const [attachmentModalVisible, setAttachmentModalVisible] = useState(false);

    // --- New states for Full-Screen Image Preview ---
    const [fullScreenImageVisible, setFullScreenImageVisible] = useState(false);
    const [currentFullScreenImageUri, setCurrentFullScreenImageUri] = useState<string | null>(null);

    // --- REVISED & MORE ROBUST OTP Handling Functions ---
    const handleOtpChange = (text: string, index: number) => {
        setOtpError(null); // Clear error at the start of verification attempt

        const otpArray = currentOtp.split(''); // Create a mutable copy of the OTP digits

        if (text.length === 1) {
            // User typed a digit
            otpArray[index] = text;
            setCurrentOtp(otpArray.join('')); // Update the OTP state

            if (index < 3) { // If not the last input, move focus to the next
                otpInputRefs.current[index + 1]?.focus();
            } else { // If last digit entered, dismiss keyboard
                Keyboard.dismiss();
            }

        } else if (text === '') {
            // User cleared the field (e.g., via backspace or iOS 'x' clear button)

            // If the current field was already empty, and it's not the first field,
            // move focus to the previous field and clear its content.
            if (otpArray[index] === '' && index > 0) {
                otpInputRefs.current[index - 1]?.focus();
                otpArray[index - 1] = ''; // Clear the previous digit in the array
            }

            // Always clear the current digit in the array
            otpArray[index] = '';
            setCurrentOtp(otpArray.join(''));
        }

        // Auto-submit if all 4 digits are entered correctly (without empty spaces)
        const updatedOtp = otpArray.join('');
        if (updatedOtp.length === 4 && !updatedOtp.includes('')) {
            if (otpInputVisible) {
                handleAccessOtpVerification();
            } else if (otpForDeliveryVisible) {
                handleDeliveryOtpVerification();
            }
        }
    };

    // handleOtpKeyPress: Specifically for physical 'Backspace' key detection on an already empty field.
    // This is crucial because `onChangeText` might not fire if the field is empty and backspace is pressed.
    const handleOtpKeyPress = (
        e: NativeSyntheticEvent<TextInputKeyPressEvent>,
        index: number
    ) => {
        if (e.nativeEvent.key === 'Backspace' && index > 0) {
            otpInputRefs.current[index - 1]?.focus();

            // Clear the previous box explicitly
            const otpArray = currentOtp.split('');
            otpArray[index - 1] = '';
            setCurrentOtp(otpArray.join(''));
        }
    };

    // --- End REVISED OTP Handling Functions ---


    const requestCameraAndStoragePermissions = async (): Promise<boolean> => {
        if (Platform.OS === 'android') {
            try {
                const permissions = [
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    // READ_EXTERNAL_STORAGE for Android < 13
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                ];

                // For Android 13+ (API level 33), READ_EXTERNAL_STORAGE is deprecated for media
                // and replaced by READ_MEDIA_IMAGES and READ_MEDIA_VIDEO
                if (Number(Platform.Version) >= 33) {
                    permissions.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
                    permissions.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO);
                }


                const grantedResults = await PermissionsAndroid.requestMultiple(permissions);

                const cameraGranted = grantedResults[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED;
                // Check if any of the relevant storage permissions are granted
                const readStorageGranted = (grantedResults[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED) ||
                    (Number(Platform.Version) >= 33 &&
                        (grantedResults[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] === PermissionsAndroid.RESULTS.GRANTED ||
                            grantedResults[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] === PermissionsAndroid.RESULTS.GRANTED));

                if (cameraGranted && readStorageGranted) {
                    console.log('Camera and Storage permissions granted');
                    return true;
                } else {
                    console.log('Permissions denied');
                    Alert.alert(
                        'Permissions Required',
                        'Camera and Storage permissions are needed to take and upload photos/videos. Please enable them in settings.'
                    );
                    return false;
                }
            } catch (err) {
                console.warn('Permission request error:', err);
                Alert.alert('Permission Error', 'An error occurred while requesting permissions.');
                return false;
            }
        }
        return true; // For iOS, permissions are usually handled automatically by info.plist and prompted by picker
    };

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
        setOtpError(null); // Clear error at the start of verification attempt
        if (currentOtp.length !== 4) {
            setOtpError('Please enter the 4-digit OTP.');
            return;
        }

        setIsLoadingOtp(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (currentOtp === '1234') { // This is the hardcoded OTP for access
            setIsOtpVerifiedForAccess(true);
            setOtpInputVisible(false); // Close this modal
            setCurrentOtp(''); // Clear OTP for next potential use
            Alert.alert('Success', 'Order details unlocked!');
        } else {
            setOtpError('The OTP you entered is incorrect. Please try again.');
        }
        setIsLoadingOtp(false);
    };

    const handleDeliveryOtpVerification = async () => {
        setOtpError(null); // Clear error at the start of verification attempt
        if (currentOtp.length !== 4) {
            setOtpError('Please enter the 4-digit OTP.');
            return;
        }

        setIsLoadingOtp(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // ****** IMPORTANT: The hardcoded OTP for delivery is '5678' ******
        if (currentOtp === '5678') { // This is the hardcoded OTP for delivery
            setShipmentStatus(prev => ({ ...prev, delivered: true }));
            setOtpForDeliveryVisible(false); // Close this modal
            setCurrentOtp(''); // Clear OTP for next potential use
            Alert.alert('Delivery Confirmed', 'The shipment has been successfully marked as delivered.');
        } else {
            setOtpError('The OTP you entered is incorrect. Please try again.');
        }
        setIsLoadingOtp(false);
    };

    const handleStatusChange = (statusKey: keyof ShipmentStatus, value: boolean) => {
        if (statusKey === 'pickedUp' && value === true) {
            setShipmentStatus(prev => ({ ...prev, pickedUp: true }));
        } else if (statusKey === 'inTransit' && value === true && shipmentStatus.pickedUp) {
            setShipmentStatus(prev => ({ ...prev, inTransit: true }));
        } else if (statusKey === 'delivered' && value === true && shipmentStatus.inTransit) {
            setOtpForDeliveryVisible(true); // Open delivery OTP modal
            setCurrentOtp(''); // Clear previous OTP attempts
            setOtpError(null); // Clear previous errors
            setTimeout(() => otpInputRefs.current[0]?.focus(), 100); // Focus first OTP input
        }
    };

    const resolveUriForDisplay = async (originalUri: string, fileName: string | null = null): Promise<string> => {
        console.log(`[resolveUriForDisplay] Original URI from picker: ${originalUri}`);

        if (!originalUri) {
            console.warn("[resolveUriForDisplay] Provided URI is null or empty.");
            return '';
        }

        // For iOS, and for Android if URI is already a file path, return directly.
        // On iOS, image picker often returns 'ph://' or 'assets-library://' which Image component handles
        // but RNFS.copyFile cannot directly process. We assume Image component handles these.
        if (Platform.OS === 'ios' || originalUri.startsWith('file://')) {
            console.log(`[resolveUriForDisplay] Returning original URI (iOS or already file://): ${originalUri}`);
            return originalUri;
        }

        // For Android 'content://' URIs, copy to app's cache directory
        if (originalUri.startsWith('content://')) {
            try {
                // Ensure a unique filename and appropriate extension
                const extension = originalUri.split('.').pop() || 'jpg'; // Default to jpg if no extension found
                const name = fileName ? `${fileName.split('.')[0]}_${Date.now()}.${extension}` : `temp_file_${Date.now()}.${extension}`;
                const destinationPath = `${RNFS.CachesDirectoryPath}/${name}`;

                console.log(`[resolveUriForDisplay] Copying content URI to: ${destinationPath}`);
                await RNFS.copyFile(originalUri, destinationPath);
                const fileUri = `file://${destinationPath}`;
                console.log(`[resolveUriForDisplay] Resolved file:// URI: ${fileUri}`);
                return fileUri;
            } catch (copyError) {
                console.error('[resolveUriForDisplay] Failed to copy content URI to file path:', copyError);
                Alert.alert('File Error', 'Could not prepare the selected file for display. Please try again.');
                // Fallback to originalUri, though it might not display
                return originalUri;
            }
        }

        console.log(`[resolveUriForDisplay] Unknown URI format, returning original: ${originalUri}`);
        return originalUri;
    };

    const addProcessedMedia = async (asset: Asset) => {
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
        console.log(`Added ${type}: ${asset.fileName || asset.uri}, Display URI: ${newItem.displayUri}`);
    };

    const handleTakePhoto = async () => {
        setAttachmentModalVisible(false); // Close the bottom sheet
        const hasPermission = await requestCameraAndStoragePermissions();
        if (!hasPermission) {
            console.log('Camera or Storage permissions not granted. Cannot take photo.');
            return;
        }

        // Small delay to allow modal to close completely and prevent UI glitches
        setTimeout(async () => {
            try {
                console.log('Launching camera...');
                const result = await launchCamera({
                    mediaType: 'photo',
                    quality: 0.7,
                    includeBase64: false,
                    saveToPhotos: true, // Saves captured photo to device gallery
                    maxWidth: 1024,
                    maxHeight: 768,
                });

                if (result.didCancel) {
                    console.log('User cancelled camera operation.');
                    return;
                }
                if (result.errorCode) {
                    console.error('Camera Error: ', result.errorCode, result.errorMessage);
                    Alert.alert('Camera Error', `Could not take photo: ${result.errorMessage || result.errorCode}`);
                    return;
                }

                if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
                    console.log('Photo captured:', result.assets[0].uri);
                    await addProcessedMedia(result.assets[0]);
                    Alert.alert('Upload Successful', 'Photo uploaded successfully.');
                } else {
                    console.warn('No asset URI found after taking photo.');
                    Alert.alert('Error', 'Could not get photo URI from camera. Please try again.');
                }
            } catch (error) {
                console.error('General Camera error:', error);
                Alert.alert('Error', 'An unexpected error occurred while accessing the camera.');
            }
        }, 300); // Delay for 300ms
    };

    const handleChooseFromLibrary = async () => {
        setAttachmentModalVisible(false); // Close the bottom sheet
        const hasPermission = await requestCameraAndStoragePermissions();
        if (!hasPermission) {
            console.log('Storage permissions not granted. Cannot choose from library.');
            return;
        }

        // Small delay to allow modal to close completely and prevent UI glitches
        setTimeout(async () => {
            try {
                console.log('Launching image library...');
                const result = await launchImageLibrary({
                    mediaType: 'photo', // Changed to photo, as per request
                    selectionLimit: 1, // Changed to 1 to limit to a single image
                    quality: 0.7,
                    includeBase64: false,
                    maxWidth: 1024,
                    maxHeight: 768,
                });

                if (result.didCancel) {
                    console.log('User cancelled image picker.');
                    return;
                }
                if (result.errorCode) {
                    console.error('ImagePicker Error: ', result.errorCode, result.errorMessage);
                    Alert.alert('Library Error', `Could not pick from library: ${result.errorMessage || result.errorCode}`);
                    return;
                }

                // Since selectionLimit is 1, we only expect one asset or none
                if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
                    console.log('Image selected from library:', result.assets[0].uri);
                    await addProcessedMedia(result.assets[0]); // Only process the first asset
                    Alert.alert('Upload Successful', 'Photo uploaded successfully.');
                } else {
                    console.warn('No asset URI found after picking from library.');
                    Alert.alert('Error', 'No photo URI from library. Please try again.');
                }
            } catch (error) {
                console.error('General Media picker error:', error);
                Alert.alert('Error', 'An unexpected error occurred while picking from library.');
            }
        }, 300); // Delay for 300ms
    };

    const handleImageUploadButton = () => {
        setAttachmentModalVisible(true); // Open the bottom sheet
    };

    // --- New Full-Screen Image Preview Handlers ---
    const openFullScreenImage = (uri: string) => {
        setCurrentFullScreenImageUri(uri);
        setFullScreenImageVisible(true);
    };

    const closeFullScreenImage = () => {
        setFullScreenImageVisible(false);
        setCurrentFullScreenImageUri(null);
    };

    const renderOtpInputs = () => {
        const inputs = [];
        for (let i = 0; i < 4; i++) {
            inputs.push(
                <TextInput
                    key={i}
                    ref={(el: TextInput | null) => { otpInputRefs.current[i] = el; }}
                    style={[styles.otpDigitInput, otpError ? styles.otpDigitInputError : {}]}
                    keyboardType="numeric"
                    maxLength={1}
                    onChangeText={text => handleOtpChange(text, i)}
                    onKeyPress={e => handleOtpKeyPress(e, i)}
                    value={currentOtp[i] || ''}
                    blurOnSubmit={false}
                    caretHidden={false}
                    selectTextOnFocus={true}
                />
            );
        }
        return (
            <View style={styles.otpInputsContainer}>
                {inputs}
            </View>
        );
    };

    // Function to handle navigating back (used by header back button and modal cancel)
    const handleGoBack = () => {
        // Just navigate back. The masking logic is now directly tied to isOtpVerifiedForAccess.
        navigation.goBack();
        // Clear OTP states just in case the modal wasn't fully dismissed
        setOtpInputVisible(false);
        setOtpForDeliveryVisible(false);
        setCurrentOtp('');
        setOtpError(null);
        setIsLoadingOtp(false);
    };


    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar backgroundColor="white" barStyle="dark-content" />
            {/* Header */}
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                    <FontAwesomeIcon icon={faArrowLeft} size={20} color="#333" />
                </TouchableOpacity>
                <Text style={styles.orderTitle}>Order #{order.id}</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.orderTime}>Created on {order.date}, {order.time}</Text>

                {/* Integrated Carousel Component for initial images */}
                <View style={styles.carouselWrapperStyle}>
                    <OrderDetailsCarousel images={convertImageUrisToCarouselItems(order.initialImages)} />
                </View>

                {/* Requested Images Upload Section - ALWAYS VISIBLE */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Requested Images Upload</Text>
                    {/* Ensure 'pending requests' and other text is wrapped in Text components */}
                    <Text style={styles.infoText}>
                        You have <Text style={{ fontWeight: 'bold' }}>{imageRequestsCount} pending requests</Text> for images from the sender. Please upload them here.
                    </Text>
                    <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={handleImageUploadButton}
                    >
                        <FontAwesomeIcon icon={faUpload} size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={styles.uploadButtonText}>Upload Image</Text>
                    </TouchableOpacity>

                    {uploadedImages.length > 0 && (
                        <View style={styles.uploadedImagesContainer}>
                            <Text style={styles.uploadedImagesTitle}>Images Sent by You:</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.uploadedImagesScrollView}>
                                {uploadedImages.map((item, index) => (
                                    <TouchableOpacity // Make the image clickable
                                        key={index}
                                        style={styles.uploadedImageWrapper}
                                        onPress={() => openFullScreenImage(item.displayUri)}
                                    >
                                        <Image
                                            source={{ uri: item.displayUri }}
                                            style={styles.uploadedImage}
                                            resizeMode="cover"
                                            onError={(e) => console.error('Uploaded media load error:', e.nativeEvent.error, 'URI:', item.displayUri)}
                                        />
                                        {item.type === 'video' && (
                                            <View style={styles.videoOverlay}>
                                                <FontAwesomeIcon icon={faPlayCircle} size={24} color="#fff" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>

                {/* Transporter Details - ALWAYS RENDERED, but masked if not verified */}
                <View style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.sectionTitle}>Transporter</Text>
                        <TouchableOpacity style={styles.sosIcon}>
                            <FontAwesomeIcon icon={faShieldAlt} size={18} color="red" />
                            <Text style={{ fontSize: 10, color: 'red', marginTop: 2 }}>SOS</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.rowStart}>
                        <Image source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} style={styles.transporterImage} />
                        <View>
                            <Text style={styles.infoTextBold}>
                                {isOtpVerifiedForAccess ? `${transporterName} (ID: TR1234)` : 'xxxxxxxx (ID: TRxxxx)'}
                            </Text>
                            <Text style={styles.infoText}>
                                Phone: {isOtpVerifiedForAccess ? transporterPhone : 'xxxxxxxxxx'}
                            </Text>
                            <View style={styles.ratingRow}>
                                {renderStars(transporterRating)}
                                <Text style={styles.ratingText}>{transporterRating.toFixed(1)}</Text>
                            </View>
                            {/* Disable icons if not verified */}
                            <View style={styles.transporterIcons}>
                                <TouchableOpacity style={[styles.iconButton, { marginRight: 12 }]} disabled={!isOtpVerifiedForAccess}>
                                    <FontAwesomeIcon icon={faComments} size={20} color={isOtpVerifiedForAccess ? "#FF5A5F" : "#CCC"} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.iconButton} disabled={!isOtpVerifiedForAccess}>
                                    <FontAwesomeIcon icon={faPhone} size={20} color={isOtpVerifiedForAccess ? "#FF5A5F" : "#CCC"} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                {isOtpVerifiedForAccess ? (
                    // Display these sections ONLY if OTP is verified
                    <>
                        {/* Receiver Details - Visible only after OTP verification */}
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Receiver Details</Text>
                            <Text style={styles.infoText}>Name: {receiverName}</Text>
                            <Text style={styles.infoText}>Phone: {receiverPhone}</Text>
                            <Text style={styles.infoText}>Gender: {receiverGender}</Text>
                        </View>

                        {/* Update Shipment Status - Visible only after OTP verification */}
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Update Shipment Status</Text>
                            <View style={styles.statusRow}>
                                <View style={styles.statusLabel}>
                                    <FontAwesomeIcon icon={faBoxOpen} size={16} color="#3B82F6" style={{ marginRight: 8 }} />
                                    <Text style={styles.infoText}>Picked Up</Text>
                                </View>
                                <Switch
                                    value={shipmentStatus.pickedUp}
                                    onValueChange={(value) => handleStatusChange('pickedUp', value)}
                                    thumbColor={shipmentStatus.pickedUp ? '#4CAF50' : (Platform.OS === 'android' ? '#f4f3f4' : '#E9E9EA')}
                                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                                    disabled={shipmentStatus.pickedUp}
                                />
                            </View>
                            <View style={styles.statusRow}>
                                <View style={styles.statusLabel}>
                                    <FontAwesomeIcon icon={faTruck} size={16} color="#FFA500" style={{ marginRight: 8 }} />
                                    <Text style={styles.infoText}>In Transit</Text>
                                </View>
                                <Switch
                                    value={shipmentStatus.inTransit}
                                    onValueChange={(value) => handleStatusChange('inTransit', value)}
                                    thumbColor={shipmentStatus.inTransit ? '#FFA500' : (Platform.OS === 'android' ? '#f4f3f4' : '#E9E9EA')}
                                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                                    disabled={shipmentStatus.inTransit || !shipmentStatus.pickedUp}
                                />
                            </View>
                            <View style={styles.statusRowNoBorder}>
                                <View style={styles.statusLabel}>
                                    <FontAwesomeIcon icon={faCheckCircle} size={16} color="#16a34a" style={{ marginRight: 8 }} />
                                    <Text style={styles.infoText}>Delivered</Text>
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
                    </>
                ) : (
                    // Display sender details and OTP prompt if NOT verified
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Sender Details</Text>
                        <Text style={styles.infoText}>Name: {senderName}</Text>
                        <Text style={styles.infoText}>Phone: {senderPhone}</Text>
                        <Text style={styles.infoText}>Gender: {senderGender}</Text>
                        <View style={styles.accessPrompt}>
                            <FontAwesomeIcon icon={faLock} size={18} color="#FF5A5F" style={{ marginRight: 8 }} />
                            <Text style={styles.accessPromptText}>
                                Enter OTP to access full order details
                            </Text>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* OTP Modal (Centered) */}
            <Modal
                animationType="fade"
                transparent={true}
                // The modal is visible if otpInputVisible is true (for sender OTP)
                // OR if otpForDeliveryVisible is true (for delivery OTP).
                // Initial sender OTP modal only shows if !isOtpVerifiedForAccess.
                visible={(otpInputVisible && !isOtpVerifiedForAccess) || otpForDeliveryVisible}
                onRequestClose={handleGoBack}
            >
                {/* This TouchableWithoutFeedback handles taps on the semi-transparent background to dismiss keyboard */}
                <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                    {/* Changed modalOverlay to be fully opaque for privacy */}
                    <View style={styles.modalOverlay}>
                        {/* This inner TouchableWithoutFeedback ensures that taps *on the modal content* don't dismiss the keyboard,
                            allowing interaction with buttons/text inputs. */}
                        <TouchableWithoutFeedback>
                            {/* The ScrollView makes the content scrollable if it overflows.
                                Its contentContainerStyle helps control the inner layout and size. */}
                            <ScrollView
                                style={styles.modalScrollView}
                                contentContainerStyle={styles.modalContentContainer}
                                keyboardShouldPersistTaps="handled" // Important for inputs within scrollview
                            >
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalTitle}>
                                    {otpInputVisible ? 'Enter Sender OTP' : 'Enter Delivery OTP'}
                                    </Text>
                                    <Text style={styles.modalDescription}>A 4-digit OTP has been sent to the {otpInputVisible ? 'sender' : 'receiver'}'s phone number.</Text>
                                    {renderOtpInputs()}
                                    {isLoadingOtp ? (
                                        <ActivityIndicator size="small" color="#FF5A5F" style={{ marginTop: 10 }} />
                                    ) : (
                                        otpError && <Text style={styles.errorText}>{otpError}</Text>
                                    )}
                                    <TouchableOpacity
                                        style={styles.verifyButton}
                                        onPress={otpInputVisible ? handleAccessOtpVerification : handleDeliveryOtpVerification}
                                        disabled={isLoadingOtp}
                                    >
                                    <Text style={styles.verifyButtonText}>Verify OTP</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={handleGoBack}
                                    >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Attachment Options Modal (Bottom Sheet Style) */}
            <Modal
                animationType="slide" // Slide from bottom
                transparent={true}
                visible={attachmentModalVisible}
                onRequestClose={() => setAttachmentModalVisible(false)} // Dismisses modal if hardware back button pressed
            >
                {/* Overlay to dismiss when tapping outside */}
                <TouchableWithoutFeedback onPress={() => setAttachmentModalVisible(false)}>
                    {/* Changed bottomSheetOverlay to be fully opaque for privacy */}
                    <View style={styles.bottomSheetOverlay}>
                        {/* Content Container - prevent dismissing when tapping on the sheet itself */}
                        <TouchableWithoutFeedback>
                            <View style={styles.bottomSheetContainer}>
                                <TouchableOpacity
                                    style={styles.bottomSheetOptionButton}
                                    onPress={handleTakePhoto}
                                >
                                    <FontAwesomeIcon icon={faCamera} size={22} color="#FF5A5F" style={{ marginRight: 15 }} />
                                    <Text style={styles.bottomSheetOptionText}>Take Photo</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.bottomSheetOptionButton}
                                    onPress={handleChooseFromLibrary}
                                >
                                    <FontAwesomeIcon icon={faImages} size={22} color="#FF5A5F" style={{ marginRight: 15 }} />
                                    <Text style={styles.bottomSheetOptionText}>Choose from Library</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.bottomSheetOptionButton, styles.bottomSheetCancelButton]}
                                    onPress={() => setAttachmentModalVisible(false)}
                                >
                                    <FontAwesomeIcon icon={faTimes} size={22} color="#333" style={{ marginRight: 15 }} />
                                    <Text style={styles.bottomSheetCancelText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>


            {/* Full-Screen Image Preview Modal (Keep as is) */}
            <Modal
                visible={fullScreenImageVisible}
                transparent={true}
                onRequestClose={closeFullScreenImage}
            >
                <View style={styles.fullScreenImageModalOverlay}>
                    {currentFullScreenImageUri && (
                        <Image
                            source={{ uri: currentFullScreenImageUri }}
                            style={styles.fullScreenImage}
                            resizeMode="contain"
                        />
                    )}
                    <TouchableOpacity onPress={closeFullScreenImage} style={styles.fullScreenCloseButton}>
                        <FontAwesomeIcon icon={faTimes} size={30} color="#fff" />
                    </TouchableOpacity>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f7f7f7',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
    },
    backButton: {
        padding: 5,
    },
    orderTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    orderTime: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        paddingVertical: 10,
        backgroundColor: '#f0f0f0',
    },
    carouselWrapperStyle: {
        height: height * 0.3, // Adjust height as needed
        width: '100%',
        marginTop: 10,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginHorizontal: 15,
        marginTop: 15,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 15,
        color: '#555',
        marginBottom: 4,
    },
    infoTextBold: {
        fontSize: 15,
        color: '#333',
        fontWeight: '600',
        marginBottom: 4,
    },
    accessPrompt: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffe0e0',
        padding: 10,
        borderRadius: 8,
        marginTop: 15,
        borderWidth: 1,
        borderColor: '#FF5A5F',
    },
    accessPromptText: {
        fontSize: 14,
        color: '#FF5A5F',
        fontWeight: '500',
    },
    rowStart: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    transporterImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
        borderWidth: 1,
        borderColor: '#eee',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    ratingText: {
        fontSize: 13,
        color: '#777',
        marginLeft: 5,
    },
    transporterIcons: {
        flexDirection: 'row',
        marginTop: 5,
    },
    iconButton: {
        backgroundColor: '#ffebe6',
        padding: 8,
        borderRadius: 20,
    },
    sosIcon: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fee',
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'red',
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    statusRowNoBorder: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    statusLabel: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    uploadButton: {
        backgroundColor: '#FF5A5F',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 15,
    },
    uploadButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    uploadedImagesContainer: {
        marginTop: 20,
    },
    uploadedImagesTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    uploadedImagesScrollView: {
        paddingVertical: 5,
    },
    uploadedImageWrapper: {
        marginRight: 10,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#eee',
    },
    uploadedImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    videoOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    // --- OTP Modal Styles (Centered) ---
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 1)', // Fully opaque black background
    },
    modalScrollView: {
        maxHeight: height * 0.7,
        width: '90%',
        borderRadius: 15,
        backgroundColor: 'transparent',
    },
    modalContentContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        minHeight: height * 0.3,
    },
    modalContent: {
        width: '100%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    modalDescription: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 22,
    },
    otpInputsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        marginBottom: 20,
    },
    otpDigitInput: {
        width: 50,
        height: 50,
        borderWidth: 2,
        borderColor: '#ccc',
        borderRadius: 10,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        backgroundColor: '#f9f9f9',
    },
    otpDigitInputError: {
        borderColor: 'red',
        borderWidth: 2,
    },
    errorText: {
        color: 'red',
        marginTop: 10,
        fontSize: 14,
        textAlign: 'center',
    },
    verifyButton: {
        backgroundColor: '#FF5A5F',
        paddingVertical: 14,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
        marginTop: 20,
    },
    verifyButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        marginTop: 15,
        paddingVertical: 10,
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 15,
    },

    // --- Bottom Sheet Modal Styles (for Attachments) ---
    bottomSheetOverlay: {
        flex: 1,
        justifyContent: 'flex-end', // Position content at the bottom
        backgroundColor: 'rgba(0, 0, 0, 1)', // Fully opaque black background
    },
    bottomSheetContainer: {
        backgroundColor: '#FFFFFF',
        width: '100%',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        alignItems: 'center',
        paddingBottom: Platform.OS === 'ios' ? 30 : 20, // Adjust for iPhone notch
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 10,
    },
    bottomSheetOptionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0', // Lighter background for options
        paddingVertical: 15,
        borderRadius: 10,
        width: '90%', // Wider buttons
        justifyContent: 'center',
        marginBottom: 10, // Spacing between options
    },
    bottomSheetOptionText: {
        color: '#333', // Darker text for better contrast
        fontSize: 18,
        fontWeight: '600',
    },
    bottomSheetCancelButton: {
        backgroundColor: '#E0E0E0', // Distinct color for cancel
        marginTop: 10,
    },
    bottomSheetCancelText: {
        color: '#333',
        fontSize: 18,
        fontWeight: '600',
    },

    // --- Full Screen Image Modal Styles ---
    fullScreenImageModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenImage: {
        width: '95%',
        height: '80%',
    },
    fullScreenCloseButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        padding: 10,
    },
});