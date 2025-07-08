import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ViewStyle } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCalendarAlt, faClock, faBusSimple, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import Svg, { Path, Circle } from 'react-native-svg';

// --- Constants & Design Tokens ---
const { width } = Dimensions.get('window');

const DesignTokens = {
  card: {
    width: width * 0.9,
    borderRadius: 12,
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginVertical: 16,
    shadow: {
      color: '#000',
      offset: { width: 0, height: 6 },
      opacity: 0.08,
      radius: 12,
      elevation: 8,
    },
    border: {
      width: StyleSheet.hairlineWidth,
      color: '#e0e0e0',
    },
  },
  perforation: {
    size: 20,
    lineHeight: 1,
    lineColor: '#e0e0e0',
  },
  semiCirclePunch: { // New token for the big punched out
    width: 80, // Width of the semicircle base
    height: 40, // Half of the width for a perfect semicircle
  },
  colors: {
    primary: '#0056b3',
    secondary: '#6c757d',
    background: '#fafafa', // This is the screen background color!
    cardBackground: '#ffffff',
    text: {
      dark: '#343a40',
      light: '#ffffff',
      muted: '#868e96',
    },
    accent: '#28a745',
    divider: '#dee2e6',
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
    xLarge: 32,
  },
  typography: {
    header: {
      fontSize: 22,
      fontWeight: '700',
    },
    location: {
      fontSize: 16,
      fontWeight: '600',
    },
    detailLabel: {
      fontSize: 13,
      fontWeight: '500',
    },
    detailValue: {
      fontSize: 16,
      fontWeight: '700',
    },
    tripDuration: {
      label: {
        fontSize: 14,
        fontWeight: '500',
      },
      value: {
        fontSize: 40,
        fontWeight: '900',
      },
    },
    button: {
      fontSize: 16,
      fontWeight: '700',
    },
  },
};

// --- Interfaces ---
interface ShipmentCardProps {
  shipmentCount: number;
  originLocation: string;
  destinationLocation: string;
  travelDate: string;
  travelTime: string;
  estimatedTripDays: number;
  onViewAllPress: () => void;
  style?: ViewStyle;
}

// --- Reusable Sub-components ---
interface DetailItemProps {
  icon: any;
  value: string;
  label?: string;
  color?: string;
  size?: number;
}

const DetailItem: React.FC<DetailItemProps> = ({
  icon,
  value,
  label,
  color = DesignTokens.colors.text.dark,
  size = 14,
}) => (
  <View style={styles.detailItemContainer}>
    <FontAwesomeIcon icon={icon} size={size} color={color} />
    {label && <Text style={[styles.detailItemLabel, { color }]}>{label}</Text>}
    <Text style={[styles.detailItemValue, { color }]}>{value}</Text>
  </View>
);

// --- Main Component ---
const ShipmentTicketCard: React.FC<ShipmentCardProps> = ({
  shipmentCount,
  originLocation,
  destinationLocation,
  travelDate,
  travelTime,
  estimatedTripDays,
  onViewAllPress,
  style,
}) => {
  return (
    <View style={[styles.cardContainer, style]}>
      {/* Big punched-out at the top middle - now exactly at the top */}
      <View style={styles.largeTopSemiCirclePunch} />

      {/* Top Perforation Line (can be removed if the semicircle acts as the top "tear") */}
      <View style={styles.perforationLineTop} />
      {/* Bottom Perforation Line */}
      <View style={styles.perforationLineBottom} />

      <View style={styles.contentWrapper}>
        <View style={{ marginBottom: 20 }}>
          <View
            style={{ marginTop: 0, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
          >
            <FontAwesomeIcon
              icon={faBoxOpen}
              size={DesignTokens.typography.header.fontSize + 20}
              color={"#FF5A5F"}
            />
            <Text style={[styles.headerTitle, {marginTop: 30}]}>
              {'   '}
              {shipmentCount} Available Shipments
            </Text>
          </View>
        </View>

        {/* Route Visualizer */}
        <View style={styles.routeSection}>
          <View style={styles.locationBlock}>
            <FontAwesomeIcon icon={faBusSimple} size={28} color={"gray"} />
            <Text style={styles.locationText}>{originLocation}</Text>
          </View>

          <View style={styles.routeLineContainer}>
            <Svg width="100%" height="30" viewBox="0 0 200 30">
              <Circle cx="10" cy="15" r="4" fill={DesignTokens.colors.primary} />
              <Path
                d="M 10 15 C 70 0, 130 0, 190 15"
                stroke={DesignTokens.colors.divider}
                strokeWidth={2}
                strokeDasharray="6,6"
                fill="none"
              />
              <Circle cx="190" cy="15" r="4" fill={DesignTokens.colors.primary} />
            </Svg>
          </View>

          <View style={styles.locationBlock}>
            <FontAwesomeIcon icon={faBusSimple} size={28} color={"gray"} />
            <Text style={styles.locationText}>{destinationLocation}</Text>
          </View>
        </View>

        {/* Shipment Details: Date and Time */}
        <View style={styles.detailsSection}>
          <DetailItem icon={faCalendarAlt} value={travelDate} />
          <DetailItem icon={faClock} value={travelTime} />
        </View>

        {/* Trip Duration Highlight */}
        <View style={styles.tripDurationHighlight}>
          <Text style={styles.tripDurationLabel}>Your Trip In</Text>
          <Text><Text style={styles.tripDurationValue}>{estimatedTripDays}</Text> Days</Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onViewAllPress}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonText}>View All Shipments</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- Stylesheet ---
const styles = StyleSheet.create({
  cardContainer: {
    width: DesignTokens.card.width,
    backgroundColor: DesignTokens.colors.cardBackground,
    borderRadius: DesignTokens.card.borderRadius,
    paddingVertical: DesignTokens.card.paddingVertical,
    paddingHorizontal: DesignTokens.card.paddingHorizontal,
    marginVertical: DesignTokens.card.marginVertical,
    alignSelf: 'center',
    shadowColor: DesignTokens.card.shadow.color,
    shadowOffset: DesignTokens.card.shadow.offset,
    shadowOpacity: DesignTokens.card.shadow.opacity,
    shadowRadius: DesignTokens.card.shadow.radius,
    elevation: DesignTokens.card.shadow.elevation,
    overflow: 'hidden', // CHANGE THIS TO 'hidden' for precise top cutout
    borderWidth: DesignTokens.card.border.width,
    borderColor: DesignTokens.card.border.color,
  },
  // Style for the large top semicircle punch
  largeTopSemiCirclePunch: {
    position: 'absolute',
    width: DesignTokens.semiCirclePunch.width,
    height: DesignTokens.semiCirclePunch.height * 2, // Double the height to make it a full circle
    borderRadius: DesignTokens.semiCirclePunch.width / 2, // Full circular border radius
    backgroundColor: DesignTokens.colors.background, // MUST match the screen's background color
    top: -DesignTokens.semiCirclePunch.height, // Position its center at the top edge of the card
    alignSelf: 'center', // Center horizontally
    zIndex: 10, // Ensure it's above the card content
    // Optional: add a border to match the card's border if desired
    // borderWidth: StyleSheet.hairlineWidth,
    // borderColor: DesignTokens.card.border.color,
  },
  perforationLineBase: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: DesignTokens.perforation.lineHeight,
    backgroundColor: DesignTokens.colors.cardBackground, // Matches card background
    zIndex: 2,
  },
  perforationLineTop: {
    ...StyleSheet.absoluteFillObject,
    height: DesignTokens.perforation.lineHeight,
    // Adjusted top to be below the semicircle punch
    top: DesignTokens.semiCirclePunch.height + DesignTokens.spacing.small, // Position below the actual punch
    borderTopWidth: DesignTokens.perforation.lineHeight,
    borderTopColor: DesignTokens.perforation.lineColor,
    borderStyle: 'dashed',
    borderRadius: 0.001,
  },
  perforationLineBottom: {
    ...StyleSheet.absoluteFillObject,
    height: DesignTokens.perforation.lineHeight,
    bottom: DesignTokens.card.paddingVertical / 2,
    borderBottomWidth: DesignTokens.perforation.lineHeight,
    borderBottomColor: DesignTokens.perforation.lineColor,
    borderStyle: 'dashed',
    borderRadius: 0.001,
  },
  contentWrapper: {
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  headerTitle: {
    ...DesignTokens.typography.header,
    color: DesignTokens.colors.text.dark,
    marginBottom: DesignTokens.spacing.large,
    textAlign: 'center',
  },
  routeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: DesignTokens.spacing.xLarge,
  },
  locationBlock: {
    alignItems: 'center',
    width: '30%',
  },
  locationText: {
    ...DesignTokens.typography.location,
    color: DesignTokens.colors.text.dark,
    marginTop: DesignTokens.spacing.small,
    textAlign: 'center',
  },
  routeLineContainer: {
    width: '40%',
    alignItems: 'center',
  },
  detailsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: DesignTokens.spacing.large,
    borderTopWidth: DesignTokens.card.border.width,
    borderBottomWidth: DesignTokens.card.border.width,
    borderColor: DesignTokens.colors.divider,
    paddingVertical: DesignTokens.spacing.medium,
  },
  detailItemContainer: {
    alignItems: 'center',
  },
  detailItemLabel: {
    ...DesignTokens.typography.detailLabel,
    color: DesignTokens.colors.text.muted,
    marginBottom: 2,
  },
  detailItemValue: {
    ...DesignTokens.typography.detailValue,
    color: DesignTokens.colors.text.dark,
  },
  tripDurationHighlight: {
    alignItems: 'center',
    marginBottom: DesignTokens.spacing.large,
  },
  tripDurationLabel: {
    ...DesignTokens.typography.tripDuration.label,
    color: DesignTokens.colors.text.muted,
    marginBottom: DesignTokens.spacing.small / 2,
  },
  tripDurationValue: {
    ...DesignTokens.typography.tripDuration.value,
    color: "#FF5A5F",
  },
  actionButton: {
    backgroundColor: "#FF5A5F",
    marginTop: DesignTokens.spacing.medium,
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 30,
    shadowColor: DesignTokens.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  actionButtonText: {
    ...DesignTokens.typography.button,
    color: DesignTokens.colors.text.light,
    textTransform: 'uppercase',
  },
});

export default ShipmentTicketCard;