import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  Platform,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faCalendarAlt,
  faClock,
  faBusSimple,
  faArrowRight,
  faWeightHanging, // Added for weight icon
  faDollarSign,    // Added for amount icon
} from '@fortawesome/free-solid-svg-icons';

// Design Tokens
const DesignTokens = {
  colors: {
    primary: '#0056b3',
    background: '#f9f9f9',
    cardBackground: '#ffffff',
    text: {
      dark: '#222',
      light: '#fff',
      muted: '#6c757d',
    },
    divider: '#e9ecef',
    // Added colors for the new buttons
    button: {
      accept: '#FF5A5F', // Green for accept
      reject: '#000000', // Red for reject
      textLight: '#fff', // White text on buttons
    },
  },
  spacing: {
    xs: 6,
    sm: 12,
    md: 16,
    lg: 24,
  },
  typography: {
    heading: { fontSize: 16, fontWeight: '700' },
    subheading: { fontSize: 14, fontWeight: '600' },
    label: { fontSize: 12, fontWeight: '500' },
    button: { fontSize: 14, fontWeight: '700' },
  },
};

interface ShipmentListItemProps {
  id: string;
  originLocation: string;
  destinationLocation: string;
  travelDate: string;
  travelTime: string;
  estimatedTripDays: number;
  onPress: (id: string) => void; // This prop will now serve for 'Accept' action
  style?: ViewStyle;
}

const ShipmentListItemCard: React.FC<ShipmentListItemProps> = ({
  id,
  originLocation,
  destinationLocation,
  travelDate,
  travelTime,
  estimatedTripDays,
  onPress, // This will be used for the Accept button
  style,
}) => {
  // Hardcoded dummy values for weight and amount, as per the constraint
  // In a real app, these would typically come from props.
  const dummyPackageWeight = 15.5; // Example weight in kg
  const dummyShipmentAmount = 250.75; // Example amount

  const handleAccept = () => {
    onPress(id); // Use the existing onPress prop for the accept action
    console.log(`Shipment ${id} Accepted!`);
    
    // Add any other accept-specific logic here
  };

  const handleReject = () => {
    console.log(`Shipment ${id} Rejected!`);
    // Add any reject-specific logic here
  };

  return (
    <View style={[styles.card, style]}>
      {/* Route */}
      <View style={styles.routeRow}>
        <View style={styles.locationBlock}>
          <FontAwesomeIcon icon={faBusSimple} size={18} color={DesignTokens.colors.primary} />
          <Text style={styles.locationText}>{originLocation}</Text>
        </View>
        <FontAwesomeIcon
          icon={faArrowRight}
          size={16}
          color={DesignTokens.colors.text.muted}
          style={styles.arrowIcon}
        />
        <View style={styles.locationBlock}>
          <FontAwesomeIcon icon={faBusSimple} size={18} color={DesignTokens.colors.primary} />
          <Text style={styles.locationText}>{destinationLocation}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Travel Details */}
      <View style={styles.detailsRow}>
        <View style={styles.detailBlock}>
          <FontAwesomeIcon icon={faCalendarAlt} size={14} color={DesignTokens.colors.text.muted} />
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>{travelDate}</Text>
        </View>
        <View style={styles.detailBlock}>
          <FontAwesomeIcon icon={faClock} size={14} color={DesignTokens.colors.text.muted} />
          <Text style={styles.detailLabel}>Time</Text>
          <Text style={styles.detailValue}>{travelTime}</Text>
        </View>
        <View style={styles.detailBlock}>
          <Text style={styles.detailLabel}>Trip</Text>
          <Text style={styles.detailValue}>{estimatedTripDays} Days</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Package Weight and Shipment Amount Details */}
      <View style={styles.detailsRow}>
        <View style={styles.detailBlock}>
          <FontAwesomeIcon icon={faWeightHanging} size={14} color={DesignTokens.colors.text.muted} />
          <Text style={styles.detailLabel}>Weight</Text>
          <Text style={styles.detailValue}>{dummyPackageWeight} kg</Text>
        </View>
        <View style={styles.detailBlock}>
          <FontAwesomeIcon icon={faDollarSign} size={14} color={DesignTokens.colors.text.muted} />
          <Text style={styles.detailLabel}>Amount</Text>
          <Text style={styles.detailValue}>${dummyShipmentAmount.toFixed(2)}</Text>
        </View>
      </View>

      {/* Accept or Reject Buttons */}
      <View style={styles.actionButtonContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={handleAccept} // Calls the function that uses the existing onPress prop
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={handleReject} // Calls the separate reject handler
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: DesignTokens.colors.cardBackground,
    borderRadius: 12,
    padding: DesignTokens.spacing.md,
    marginBottom: DesignTokens.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS === 'ios' ? 0.08 : 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: DesignTokens.spacing.sm,
  },
  locationBlock: {
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    ...DesignTokens.typography.heading,
    color: DesignTokens.colors.text.dark,
    marginTop: DesignTokens.spacing.xs,
    textAlign: 'center',
  },
  arrowIcon: {
    marginHorizontal: DesignTokens.spacing.sm,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: DesignTokens.colors.divider,
    marginVertical: DesignTokens.spacing.sm,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Changed to space-around for even distribution
    paddingVertical: DesignTokens.spacing.xs,
  },
  detailBlock: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    ...DesignTokens.typography.label,
    color: DesignTokens.colors.text.muted,
    marginTop: DesignTokens.spacing.xs,
  },
  detailValue: {
    ...DesignTokens.typography.subheading,
    color: DesignTokens.colors.text.dark,
    marginTop: DesignTokens.spacing.xs / 2,
  },
  actionButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: DesignTokens.spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: DesignTokens.spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: DesignTokens.spacing.xs,
  },
  acceptButton: {
    backgroundColor: DesignTokens.colors.button.accept,
  },
  rejectButton: {
    backgroundColor: DesignTokens.colors.button.reject,
  },
  actionButtonText: {
    ...DesignTokens.typography.button,
    color: DesignTokens.colors.button.textLight,
  },
});

export default ShipmentListItemCard;