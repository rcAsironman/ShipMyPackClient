// AllShipmentsScreen.tsx

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Platform, StatusBar, SafeAreaView } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import ShipmentListItemCard from '../components/ShipmentListItemCard'; // This is correctly imported now
const { width: SCREEN_WIDTH, height: screenHeight } = Dimensions.get('window');

// --- Design Tokens (can be imported from a central file if you have one) ---
const DesignTokens = {
  colors: {
    primary: '#0056b3',
    background: '#f0f2f5', // Matches the background for the punch-out effect
    cardBackground: '#ffffff',
    text: {
      dark: '#343a40',
      light: '#ffffff',
      muted: '#868e96',
    },
    divider: '#dee2e6',
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
    xLarge: 32,
  },
  typography: {
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
    },
  },
};

// --- Interface for Shipment Data (matches ShipmentListItemCard props) ---
interface ShipmentData {
  id: string; // Unique ID for FlatList keyExtractor
  shipmentCount: number; // This prop is not used in ShipmentListItemCard but can be kept for consistency
  originLocation: string;
  destinationLocation: string;
  travelDate: string;
  travelTime: string;
  estimatedTripDays: number;
}

// --- Dummy Data for Demonstration ---
const DUMMY_SHIPMENTS: ShipmentData[] = [
  {
    id: '1',
    shipmentCount: 5,
    originLocation: 'Hyderabad',
    destinationLocation: 'Bengaluru',
    travelDate: '2025-07-20',
    travelTime: '10:00 AM',
    estimatedTripDays: 3,
  },
  {
    id: '2',
    shipmentCount: 8,
    originLocation: 'Chennai',
    destinationLocation: 'Mumbai',
    travelDate: '2025-07-22',
    travelTime: '08:30 AM',
    estimatedTripDays: 2,
  },
  {
    id: '3',
    shipmentCount: 3,
    originLocation: 'Delhi',
    destinationLocation: 'Kolkata',
    travelDate: '2025-07-25',
    travelTime: '02:00 PM',
    estimatedTripDays: 4,
  },
  {
    id: '4',
    shipmentCount: 12,
    originLocation: 'Pune',
    destinationLocation: 'Ahmedabad',
    travelDate: '2025-07-28',
    travelTime: '11:00 AM',
    estimatedTripDays: 2,
  },
  {
    id: '5',
    shipmentCount: 6,
    originLocation: 'Jaipur',
    destinationLocation: 'Lucknow',
    travelDate: '2025-08-01',
    travelTime: '09:00 AM',
    estimatedTripDays: 3,
  },
];

const AllShipmentsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleViewShipmentDetails = (shipmentId: string) => {
    // Navigate to a detailed shipment screen, passing the ID
    console.log(`View details for shipment ID: ${shipmentId}`);
    // Example: navigation.navigate('ShipmentDetailScreen', { shipmentId });
    navigation.navigate("TransporterOngoing");
  };

  const renderShipmentItem = ({ item }: { item: ShipmentData }) => (
    //  --- CHANGE MADE HERE ---
    <ShipmentListItemCard
      id={item.id} // Pass the unique ID
      originLocation={item.originLocation}
      destinationLocation={item.destinationLocation}
      travelDate={item.travelDate}
      travelTime={item.travelTime}
      estimatedTripDays={item.estimatedTripDays}
      onPress={handleViewShipmentDetails} // Use the new 'onPress' prop
      style={styles.shipmentCard}
    />
    // --- END CHANGE ---
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={DesignTokens.colors.cardBackground} />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: Platform.OS === 'android' ? (StatusBar?.currentHeight) : screenHeight * 0.01,
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
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <FontAwesomeIcon icon={faArrowLeft} size={24} color={DesignTokens.colors.text.dark} />
        </TouchableOpacity>
         <Text style={{ fontSize: 20, fontWeight: '700', color: 'black', flex: 1, textAlign: 'center' }}>
         All Shipments
        </Text>
      </View>
      
      {/* Shipments Grid */}
      <FlatList
        data={DUMMY_SHIPMENTS}
        renderItem={renderShipmentItem}
        keyExtractor={(item) => item.id}
        numColumns={1} // Display one card per row for better readability given card width
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white", // Match your app's main background
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DesignTokens.spacing.medium,
    paddingVertical: DesignTokens.spacing.small,
    backgroundColor: DesignTokens.colors.cardBackground, // Header background
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DesignTokens.colors.divider,
    height: Platform.OS === 'android' ? 56 : 60, // Standard header height
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, // Account for Android status bar
  },
  backButton: {
    padding: DesignTokens.spacing.small, // Add padding for easier tapping
  },
  headerTitle: {
    ...DesignTokens.typography.headerTitle,
    color: DesignTokens.colors.text.dark,
    flex: 1, // Allows title to take available space
    textAlign: 'center', // Center the text
    marginLeft: -DesignTokens.spacing.large, // Pull left to counteract back button's space
  },
  headerRightPlaceholder: {
    width: 24 + DesignTokens.spacing.small * 2, // Match back button's width + padding
  },
  listContentContainer: {
    paddingHorizontal: DesignTokens.spacing.medium,
    paddingVertical: DesignTokens.spacing.medium,
    // alignItems: 'center', // Removed as ShipmentListItemCard takes 100% width
  },
  shipmentCard: {
    marginBottom: DesignTokens.spacing.medium, // Spacing between cards
    // ShipmentListItemCard defines its own width, so no need for explicit width here
  },
});

export default AllShipmentsScreen;