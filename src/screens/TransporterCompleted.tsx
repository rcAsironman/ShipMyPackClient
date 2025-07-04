import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    Switch,
    Dimensions,
    StatusBar,
    SafeAreaView,
    StyleSheet // Import StyleSheet for non-NativeWind styles
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faArrowLeft,
    faHeadset,
    faMapMarkerAlt,
    faMoneyBillWave,
    faBoxOpen,
    faTruck,
    faCheckCircle,
    faStar,
    faComments,
    faPhone
} from '@fortawesome/free-solid-svg-icons';

import OrderDetailsCarousel from '../components/OrderDetailsCarousel'; // Re-use the carousel component

// --- Type Definitions ---
interface ShipmentOrder {
    id: string;
    date: string;
    time: string;
    amount: number; // Total amount of the order
    shipmentAmount: number; // Amount for this specific shipment for transporter
    earnedAmount: number; // New: Total amount earned by transporter for this completed shipment
    startPoint: string;
    destination: string;
    status: 'ongoing' | 'completed';
    initialImages?: string[]; // The images for the carousel
    senderName?: string;
    senderPhone?: string;
    senderGender?: string;
    receiverName?: string;
    receiverPhone?: string;
    receiverGender?: string;
    senderRating?: number;
}

interface CarouselImageItem {
    uri: string;
}

type TransporterOrderDetailsRouteProp = RouteProp<
    { TransporterOrderDetails: { order: ShipmentOrder } },
    'TransporterOrderDetails'
>;
// --- End Type Definitions ---

const { height } = Dimensions.get('window');

const convertImageUrisToCarouselItems = (uris?: string[]): CarouselImageItem[] => {
    if (!uris) return [];
    return uris.map(uri => ({ uri }));
};

export default function TransporterCompletedScreen({ navigation }: { navigation: any }) {
    const route = useRoute<TransporterOrderDetailsRouteProp>();
    // Enhanced mock order data with new fields for a completed order
    const { order } = route.params || {
        order: {
            id: 'TRN001',
            date: '2023-10-26',
            time: '14:30',
            amount: 1500,
            shipmentAmount: 150,
            earnedAmount: 230, // Mock earned amount for this completed shipment (e.g., OTP + Image + Status)
            startPoint: 'Hyderabad, Telangana',
            destination: 'Bangalore, Karnataka',
            status: 'completed',
            initialImages: [
                'https://images.unsplash.com/photo-1532635042-a6f6ad4745f9?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                'https://images.unsplash.com/photo-1579726038234-5e608031d75c?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB4uNzVjfDB4MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                // Add more images here if you want to show 'uploaded' images from the completed state
            ],
            senderName: 'Jane Smith',
            senderPhone: '+91 98765 43210', // Original for masking logic
            senderGender: 'Female',
            receiverName: 'Rahul Sharma',
            receiverPhone: '+91 87654 32109', // Original for masking logic
            receiverGender: 'Male',
            senderRating: 4.2,
        }
    };

    // For a completed order, all statuses are true and disabled
    const shipmentStatus = {
        pickedUp: true,
        inTransit: true,
        delivered: true,
    };

    const senderName = order.senderName || 'Jane Smith';
    // Mask all but the last 4 digits for a 10-digit number. Adjust regex if phone numbers vary.
    // Example: +91 98765 43210 -> +91 98765 *****
    const senderPhoneMasked = order.senderPhone ? order.senderPhone.replace(/(\+\d{1,3}\s?\d{5})\d{0,}/, '$1*****') : '***** *****';
    const senderGenderMasked = order.senderGender ? order.senderGender.replace(/./g, '*') : '*****'; // Simple masking

    const senderRating = order.senderRating || 4.2;

    const receiverName = order.receiverName || 'Rahul Sharma';
    const receiverPhoneMasked = order.receiverPhone ? order.receiverPhone.replace(/(\+\d{1,3}\s?\d{5})\d{0,}/, '$1*****') : '***** *****';
    const receiverGenderMasked = order.receiverGender ? order.receiverGender.replace(/./g, '*') : '*****'; // Simple masking


    const handleGoBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

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


    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar backgroundColor="white" barStyle="dark-content" />

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

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                <Text className="text-sm text-neutral-600 text-center py-2 bg-gray-100">
                    Completed on {order.date}, {order.time}
                </Text>

                {/* Display Carousel Images */}
                {order.initialImages && order.initialImages.length > 0 ? (
                    <View style={{ height: height * 0.3 }} className="w-full mt-2">
                        <OrderDetailsCarousel images={convertImageUrisToCarouselItems(order.initialImages)} />
                    </View>
                ) : (
                    <View style={{ height: height * 0.3 }} className="w-full mt-2 justify-center items-center bg-white rounded-lg mx-4 shadow-md">
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

                {/* Sender Details - Masked & Disabled Contact */}
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
                                Phone: {senderPhoneMasked}
                            </Text>
                            <Text className="text-sm text-neutral-600">
                                Gender: {senderGenderMasked}
                            </Text>
                            <View className="flex-row items-center mb-1">
                                {renderStars(senderRating)}
                                <Text className="text-xs text-neutral-600 ml-1">{senderRating.toFixed(1)}</Text>
                            </View>
                            <View className="flex-row mt-1">
                                <TouchableOpacity
                                    className="bg-gray-200 p-2 rounded-full" // Disabled styling
                                    style={{ marginRight: 12 }}
                                    disabled={true} // Always disabled for completed screen
                                >
                                    <FontAwesomeIcon icon={faComments} size={20} color="#CCC" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="bg-gray-200 p-2 rounded-full" // Disabled styling
                                    disabled={true} // Always disabled for completed screen
                                >
                                    <FontAwesomeIcon icon={faPhone} size={20} color="#CCC" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Receiver Details - Masked */}
                <View className="bg-white rounded-lg mx-4 mt-4 p-4 shadow-md mb-4">
                    <Text className="text-base font-bold text-neutral-800 mb-2">Receiver Details</Text>
                    <Text className="text-sm text-neutral-600 mb-1">Name: {receiverName}</Text>
                    <Text className="text-sm text-neutral-600 mb-1">Phone: {receiverPhoneMasked}</Text>
                    <Text className="text-sm text-neutral-600">Gender: {receiverGenderMasked}</Text>
                </View>

                {/* Shipment Status - All True and Disabled */}
                <View className="bg-white rounded-lg mx-4 mt-4 p-4 shadow-md mb-4">
                    <Text className="text-base font-bold text-neutral-800 mb-2">Shipment Status</Text>
                    <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
                        <View className="flex-row items-center">
                            <FontAwesomeIcon icon={faBoxOpen} size={16} color="#3B82F6" style={{ marginRight: 8 }} />
                            <Text className="text-sm text-neutral-600">Picked Up</Text>
                        </View>
                        <Switch
                            value={shipmentStatus.pickedUp}
                            onValueChange={() => {}} // No action on change
                            thumbColor={shipmentStatus.pickedUp ? '#4CAF50' : (Platform.OS === 'android' ? '#f4f3f4' : '#E9E9EA')}
                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                            disabled={true} // Always disabled
                        />
                    </View>
                    <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
                        <View className="flex-row items-center">
                            <FontAwesomeIcon icon={faTruck} size={16} color="#FFA500" style={{ marginRight: 8 }} />
                            <Text className="text-sm text-neutral-600">In Transit</Text>
                        </View>
                        <Switch
                            value={shipmentStatus.inTransit}
                            onValueChange={() => {}}
                            thumbColor={shipmentStatus.inTransit ? '#FFA500' : (Platform.OS === 'android' ? '#f4f3f4' : '#E9E9EA')}
                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                            disabled={true} // Always disabled
                        />
                    </View>
                    <View className="flex-row justify-between items-center py-2">
                        <View className="flex-row items-center">
                            <FontAwesomeIcon icon={faCheckCircle} size={16} color="#16a34a" style={{ marginRight: 8 }} />
                            <Text className="text-sm text-neutral-600">Delivered</Text>
                        </View>
                        <Switch
                            value={shipmentStatus.delivered}
                            onValueChange={() => {}}
                            thumbColor={shipmentStatus.delivered ? '#007BFF' : (Platform.OS === 'android' ? '#f4f3f4' : '#E9E9EA')}
                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                            disabled={true} // Always disabled
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Total Earnings Display - Fixed at the bottom for constant visibility */}
            <View style={styles.totalEarningsContainer}>
                <FontAwesomeIcon icon={faMoneyBillWave} size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text className="text-white text-lg font-extrabold">Total Earnings: ₹{211}</Text>
            </View>
        </SafeAreaView>
    );
}

// Separate StyleSheet for consistent non-NativeWind styles (if any, currently none specific for this file)
const styles = StyleSheet.create({
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