import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faCheckCircle,
  faHourglassHalf,
  faTimesCircle,
  faWallet,
} from '@fortawesome/free-solid-svg-icons';

// ShipMyPack Colors
const Colors = {
  primary: '#DA2824',
  background: '#F9F9F9',
  cardBackground: '#FFFFFF',
  textPrimary: '#1E1E1E',
  textSecondary: '#6C757D',
  success: '#117e2b',
  warning: '#beb20e',
  danger: '#f41d33',
  border: '#E0E0E0',
};

// Format currency
const formatCurrency = (amount: number) => {
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
  return `${amount < 0 ? '-' : ''}₹ ${formatted}`;
};

const TransactionFullScreen = () => {
  const route = useRoute();
  const { transaction } = route.params as any;

  if (!transaction) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No transaction data available.</Text>
      </SafeAreaView>
    );
  }

  // Determine icon and colors
  let icon, iconColor, statusText;
  if (transaction.status === 'completed') {
    icon = faCheckCircle;
    iconColor = Colors.success;
    statusText = 'Payment Successful';
  } else if (transaction.status === 'processing') {
    icon = faHourglassHalf;
    iconColor = Colors.warning;
    statusText = 'Payment Processing';
  } else {
    icon = faTimesCircle;
    iconColor = Colors.danger;
    statusText = 'Payment Failed';
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Header */}
        <View style={styles.statusContainer}>
          <FontAwesomeIcon icon={icon} size={70} color={iconColor} />
          <Text style={[styles.statusText, { color: iconColor }]}>
            {statusText}
          </Text>
        </View>

        {/* Amount Display */}
        <View style={styles.amountContainer}>
          <Text
            style={[
              styles.amountText,
              { color: transaction.amount >= 0 ? Colors.success : Colors.danger },
            ]}
          >
            {formatCurrency(transaction.amount)}
          </Text>
        </View>

        {/* Details Card */}
        <View style={styles.card}>
          <DetailRow label="Transaction ID" value={transaction.id} />
          <DetailRow
            label="Date"
            value={new Date(transaction.date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          />
          <DetailRow
            label="Type"
            value={transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
          />
          <DetailRow
            label="Status"
            value={transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
          />
          <DetailRow
            label="Payment Mode"
            value={transaction.paymentMode || 'N/A'}
          />
        </View>

        {/* Description Block */}
        <View style={styles.descriptionBlock}>
          <Text style={styles.descriptionLabel}>Description</Text>
          <Text style={styles.descriptionText}>
            {transaction.description}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Reusable Detail Row
const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    alignItems: 'center',
    padding: 20,
  },
  statusContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  statusText: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 12,
  },
  amountContainer: {
    marginVertical: 10,
  },
  amountText: {
    fontSize: 40,
    fontWeight: '700',
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    padding: 20,
    width: '100%',
    marginVertical: 20,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  descriptionBlock: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  descriptionLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: Colors.danger,
    textAlign: 'center',
    marginTop: 50,
  },
});

export default TransactionFullScreen;
