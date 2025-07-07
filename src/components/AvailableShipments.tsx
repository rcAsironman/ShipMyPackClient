import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlaneDeparture, faPlaneArrival, faCalendarAlt, faClock, faStar, faBusSimple } from '@fortawesome/free-solid-svg-icons';
import Svg, { Path, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CUTOUT_SIZE = 40;

interface TicketCardProps {
  count: number;
  startingPoint: string;
  destination: string;
  travelDate: string;
  travelTime: string;
  tripDays: number;
  onPressViewAll: () => void;
}

const AvailableShipments: React.FC<TicketCardProps> = ({
  count,
  startingPoint,
  destination,
  travelDate,
  travelTime,
  tripDays,
  onPressViewAll,
}) => {
  return (
    <View style={styles.ticketContainer}>
      {/* Left semicircle punch */}
      <View style={styles.cutout} />

      {/* Decorative stars */}
      <FontAwesomeIcon icon={faStar} size={14} color="#fff" style={styles.starTopLeft} />
      <FontAwesomeIcon icon={faStar} size={14} color="#fff" style={styles.starTopRight} />
      <FontAwesomeIcon icon={faStar} size={14} color="#fff" style={styles.starBottomLeft} />
      <FontAwesomeIcon icon={faStar} size={14} color="#fff" style={styles.starBottomRight} />

      <View style={styles.contentWrapper}>
        <Text style={styles.headerText}>{count} Available Shipments</Text>

        {/* Route section with dashed line */}
        <View style={styles.routeRow}>
          <View style={styles.locationBlock}>
            <FontAwesomeIcon icon={faBusSimple} size={20} color="#fff" />
            <Text style={styles.locationText}>{startingPoint}</Text>
          </View>

          <View style={styles.svgContainer}>
            <Svg width="100%" height="40" viewBox="0 0 200 40">
              <Circle cx="10" cy="20" r="5" fill="#fff" />
              <Path
                d="M 10 20 Q 100 0 190 20"
                stroke="#fff"
                strokeWidth={2}
                strokeDasharray="6,6"
                fill="none"
              />
              <Circle cx="190" cy="20" r="5" fill="#fff" />
            </Svg>
          </View>

          <View style={styles.locationBlock}>
            <FontAwesomeIcon icon={faBusSimple} size={20} color="#fff" />
            <Text style={styles.locationText}>{destination}</Text>
          </View>
        </View>

        {/* Date and time */}
        <View style={styles.detailsRow}>
          <View style={styles.detailBox}>
            <FontAwesomeIcon icon={faCalendarAlt} size={14} color="#fff" />
            <Text style={styles.detailValue}>{travelDate}</Text>
          </View>
          <View style={styles.detailBox}>
            <FontAwesomeIcon icon={faClock} size={14} color="#fff" />
            <Text style={styles.detailValue}>{travelTime}</Text>
          </View>
        </View>

        {/* Trip days */}
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Your Trip in</Text>
          <Text style={styles.tripDaysText}>{tripDays} Days</Text>
        </View>

        {/* CTA Button */}
        <TouchableOpacity style={styles.button} onPress={onPressViewAll} activeOpacity={0.85}>
          <Text style={styles.buttonText}>View All Shipments</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  ticketContainer: {
    width: CARD_WIDTH,
    backgroundColor: '#3498db',
    borderRadius: 12,
    padding: 20,
    marginVertical: 20,
    overflow: 'visible',
    alignSelf: 'center',
  },
  cutout: {
    position: 'absolute',
    width: CUTOUT_SIZE,
    height: CUTOUT_SIZE,
    borderRadius: CUTOUT_SIZE / 2,
    backgroundColor: '#fff',
    left: -CUTOUT_SIZE / 2,
    top: '45%',
  },
  contentWrapper: {
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  locationBlock: {
    alignItems: 'center',
    width: '28%',
  },
  locationText: {
    color: '#fff',
    fontWeight: '600',
    marginTop: 6,
    fontSize: 15,
    textAlign: 'center',
  },
  svgContainer: {
    width: '38%',
    alignItems: 'center',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 16,
  },
  detailBox: {
    alignItems: 'center',
    marginVertical: 4,
  },
  detailLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  detailValue: {
    color: '#fff',
    fontWeight: '600',
    marginTop: 4,
    fontSize: 14,
  },
  tripDaysText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 32,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#fff',
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#3498db',
    fontWeight: '700',
    fontSize: 15,
  },
  starTopLeft: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  starTopRight: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  starBottomLeft: {
    position: 'absolute',
    bottom: 12,
    left: 12,
  },
  starBottomRight: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
});

export default AvailableShipments;