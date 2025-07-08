import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  UIManager,
  Dimensions,
  SafeAreaView, 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import {
  faWallet,
  faTimes,
  faBuildingColumns,
  faMoneyCheckDollar,
  faMobileScreenButton,
  faInfoCircle,
  faArrowUpFromBracket,
  faHourglassHalf,
  faCircleExclamation,
  faMoneyBillTransfer,
  faReceipt
} from '@fortawesome/free-solid-svg-icons';

import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';

// Enable LayoutAnimation for Android for smoother transitions if needed
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Get screen dimensions for responsive header padding
const { width: SCREEN_WIDTH, height: screenHeight } = Dimensions.get('window');

// Define your color palette
const Colors = {
  primaryBg: '#F8F9FA',
  black: '#000000',
  accent: '#FF5A5F', // A vibrant accent color for highlights
  textPrimary: '#212529',
  textSecondary: '#6C757D',
  textPlaceholder: '#ADB5BD',
  cardBackground: '#FFFFFF',
  border: '#DEE2E6',
  success: '#117e2b',
  warning: '#beb20e', // STRONGER YELLOW/ORANGE for processing
  danger: '#f41d33',
};

// Interface for transaction data (remains the same)
interface Transaction {
  id: string;
  amount: number;
  date: string;
  type: 'deposit' | 'withdrawal' | 'earning' | 'penalty';
  description: string;
  status: 'completed' | 'processing' | 'failed';
  paymentMode?: 'Bank Account' | 'UPI' | 'PhonePe' | 'Google Pay' | 'N/A';
}

// Interface for bank details (remains the same)
interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  upiId?: string;
  phonePeNumber?: string;
  googlePayNumber?: string;
}

// Dummy transaction data (remains the same)
const DUMMY_TRANSACTIONS: Transaction[] = [
  { id: 'TRN001', amount: 150.75, date: '2025-06-25', type: 'earning', description: 'Trip earnings for June 25th', status: 'completed', paymentMode: 'N/A' },
  { id: 'TRN002', amount: -25.00, date: '2025-06-24', type: 'penalty', description: 'Late cancellation penalty', status: 'completed', paymentMode: 'N/A' },
  { id: 'TRN003', amount: 300.00, date: '2025-06-23', type: 'earning', description: 'Weekly earnings payout', status: 'completed', paymentMode: 'N/A' },
  { id: 'TRN004', amount: 50.00, date: '2025-06-22', type: 'deposit', description: 'Milestone bonus for 100 trips', status: 'completed', paymentMode: 'N/A' },
  { id: 'WDR001', amount: -1000.00, date: '2025-06-20', type: 'withdrawal', description: 'Funds withdrawn to bank', status: 'completed', paymentMode: 'Bank Account' },
  { id: 'TRN005', amount: 220.50, date: '2025-06-19', type: 'earning', description: 'Trip earnings', status: 'completed', paymentMode: 'N/A' },
  { id: 'WDR002', amount: -500.00, date: '2025-06-26', type: 'withdrawal', description: 'Withdrawal request to UPI', status: 'processing', paymentMode: 'UPI' },
  { id: 'TRN006', amount: 0.00, date: '2025-06-26', type: 'earning', description: 'Earnings for current trip (pending)', status: 'processing', paymentMode: 'N/A' },
  { id: 'DEP001', amount: 25.00, date: '2025-06-26', type: 'deposit', description: 'Pending weekly bonus (processing)', status: 'processing', paymentMode: 'N/A' },
  { id: 'WDR003', amount: -300.00, date: '2025-06-25', type: 'withdrawal', description: 'Withdrawal failed due to invalid details', status: 'failed', paymentMode: 'PhonePe' },
  { id: 'PEN001', amount: -50.00, date: '2025-06-24', type: 'penalty', description: 'Late cancellation penalty', status: 'failed', paymentMode: 'N/A' },
  { id: 'TRN007', amount: 120.00, date: '2025-06-18', type: 'earning', description: 'Afternoon trip earnings', status: 'completed', paymentMode: 'N/A' },
  { id: 'TRN008', amount: -15.00, date: '2025-06-17', type: 'penalty', description: 'Minor fare adjustment', status: 'completed', paymentMode: 'N/A' },
  { id: 'TRN009', amount: 95.00, date: '2025-06-16', type: 'earning', description: 'Short-haul earnings', status: 'completed', paymentMode: 'N/A' },
  { id: 'WDR004', amount: -750.00, date: '2025-06-15', type: 'withdrawal', description: 'Funds withdrawn via PhonePe', status: 'completed', paymentMode: 'PhonePe' },
  { id: 'TRN010', amount: 180.00, date: '2025-06-14', type: 'earning', description: 'Weekend rush earnings', status: 'completed', paymentMode: 'N/A' },
  { id: 'DEP002', amount: 40.00, date: '2025-06-13', type: 'deposit', description: 'Promotional bonus', status: 'completed', paymentMode: 'N/A' },
  { id: 'TRN011', amount: 210.00, date: '2025-06-12', type: 'earning', description: 'Long distance trip', status: 'completed', paymentMode: 'N/A' },
  { id: 'WDR005', amount: -200.00, date: '2025-06-11', type: 'withdrawal', description: 'UPI withdrawal initiated', status: 'processing', paymentMode: 'UPI' },
  { id: 'TRN012', amount: 80.00, date: '2025-06-10', type: 'earning', description: 'Early morning earnings', status: 'completed', paymentMode: 'N/A' },
  { id: 'PEN002', amount: -35.00, date: '2025-06-09', type: 'penalty', description: 'Cancellation fee', status: 'failed', paymentMode: 'N/A' },
  { id: 'TRN013', amount: 250.00, date: '2025-06-08', type: 'earning', description: 'Sunday special earnings', status: 'completed', paymentMode: 'N/A' },
  { id: 'DEP003', amount: 100.00, date: '2025-06-07', type: 'deposit', description: 'Customer top-up', status: 'completed', paymentMode: 'N/A' },
  { id: 'TRN014', amount: 60.00, date: '2025-06-06', type: 'earning', description: 'Quick delivery payment', status: 'completed', paymentMode: 'N/A' },
  { id: 'WDR006', amount: -150.00, date: '2025-06-05', type: 'withdrawal', description: 'Wallet top-up reversal', status: 'completed', paymentMode: 'Google Pay' },
  { id: 'TRN015', amount: 140.00, date: '2025-06-04', type: 'earning', description: 'Late night earnings', status: 'completed', paymentMode: 'N/A' },
  { id: 'TRN016', amount: -5.00, date: '2025-06-03', type: 'penalty', description: 'App fee adjustment', status: 'completed', paymentMode: 'N/A' },
  { id: 'TRN017', amount: 190.00, date: '2025-06-02', type: 'earning', description: 'Monday morning trips', status: 'completed', paymentMode: 'N/A' },
  { id: 'DEP004', amount: 20.00, date: '2025-06-01', type: 'deposit', description: 'Login bonus', status: 'completed', paymentMode: 'N/A' },
  { id: 'TRN018', amount: 115.00, date: '2025-05-31', type: 'earning', description: 'Month-end trips', status: 'completed', paymentMode: 'N/A' },
  { id: 'WDR007', amount: -600.00, date: '2025-05-30', type: 'withdrawal', description: 'Big withdrawal to bank', status: 'completed', paymentMode: 'Bank Account' },
  { id: 'TRN019', amount: 70.00, date: '2025-05-29', type: 'earning', description: 'Short earnings for day', status: 'completed', paymentMode: 'N/A' },
  { id: 'PEN003', amount: -20.00, date: '2025-05-28', type: 'penalty', description: 'Service charge', status: 'completed', paymentMode: 'N/A' },
  { id: 'TRN020', amount: 130.00, date: '2025-05-27', type: 'earning', description: 'Mid-week earnings', status: 'completed', paymentMode: 'N/A' },
  { id: 'WDR008', amount: -400.00, date: '2025-05-26', type: 'withdrawal', description: 'Scheduled payout', status: 'processing', paymentMode: 'Bank Account' },
  { id: 'TRN021', amount: 160.00, date: '2025-05-25', type: 'earning', description: 'Weekend earnings', status: 'completed', paymentMode: 'N/A' },
  { id: 'DEP005', amount: 50.00, date: '2025-05-24', type: 'deposit', description: 'Referral incentive', status: 'completed', paymentMode: 'N/A' },
  { id: 'TRN022', amount: 90.00, date: '2025-05-23', type: 'earning', description: 'Late night rides', status: 'completed', paymentMode: 'N/A' },
  { id: 'WDR009', amount: -100.00, date: '2025-05-22', type: 'withdrawal', description: 'Emergency cashout', status: 'failed', paymentMode: 'UPI' },
  { id: 'TRN023', amount: 200.00, date: '2025-05-21', type: 'earning', description: 'Long shift earnings', status: 'completed', paymentMode: 'N/A' },
  { id: 'PEN004', amount: -10.00, date: '2025-05-20', type: 'penalty', description: 'Route deviation', status: 'completed', paymentMode: 'N/A' },
  { id: 'TRN024', amount: 125.00, date: '2025-05-19', type: 'earning', description: 'Morning earnings', status: 'completed', paymentMode: 'N/A' },
  { id: 'DEP006', amount: 30.00, date: '2025-05-18', type: 'deposit', description: 'Daily task bonus', status: 'completed', paymentMode: 'N/A' },
  { id: 'TRN025', amount: 170.00, date: '2025-05-17', type: 'earning', description: 'Saturday evening trips', status: 'completed', paymentMode: 'N/A' },
  { id: 'WDR010', amount: -250.00, date: '2025-05-16', type: 'withdrawal', description: 'Mid-month cash', status: 'completed', paymentMode: 'PhonePe' },
  { id: 'TRN026', amount: 85.00, date: '2025-05-15', type: 'earning', description: 'Short trips', status: 'completed', paymentMode: 'N/A' },
  { id: 'PEN005', amount: -5.00, date: '2025-05-14', type: 'penalty', description: 'Minor correction', status: 'completed', paymentMode: 'N/A' },
  { id: 'TRN027', amount: 145.00, date: '2025-05-13', type: 'earning', description: 'Tuesday earnings', status: 'completed', paymentMode: 'N/A' },
  { id: 'DEP007', amount: 15.00, date: '2025-05-12', type: 'deposit', description: 'Small bonus', status: 'completed', paymentMode: 'N/A' },
  { id: 'TRN028', amount: 195.00, date: '2025-05-11', type: 'earning', description: 'Sunday long trips', status: 'completed', paymentMode: 'N/A' },
  { id: 'WDR011', amount: -350.00, date: '2025-05-10', type: 'withdrawal', description: 'Weekly withdrawal', status: 'processing', paymentMode: 'Google Pay' },
  { id: 'TRN029', amount: 105.00, date: '2025-05-09', type: 'earning', description: 'Friday earnings', status: 'completed', paymentMode: 'N/A' },
  { id: 'PEN006', amount: -18.00, date: '2025-05-08', type: 'penalty', description: 'Traffic violation charge', status: 'failed', paymentMode: 'N/A' },
  { id: 'TRN030', amount: 220.00, date: '2025-05-07', type: 'earning', description: 'Busy day earnings', status: 'completed', paymentMode: 'N/A' },
];

// Helper function to format currency for Indian Rupee
const formatCurrency = (amount: number) => {
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
  return `${amount < 0 ? '-' : ''}₹ ${formattedAmount}`;
};

// Main EarningsScreen component
const EarningsScreen = ({ navigation }: { navigation: any }) => {
  // State variables
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState<boolean>(false);
  const [hasBankDetails, setHasBankDetails] = useState<boolean>(false);
  const [savedBankDetails, setSavedBankDetails] = useState<BankDetails | null>(null);

  // State for withdrawal form inputs
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [phonePeNumber, setPhonePeNumber] = useState('');
  const [googlePayNumber, setGooglePayNumber] = useState('');
  const [withdrawalMethod, setWithdrawalMethod] = useState<'bank' | 'upi' | 'phonepe' | 'googlepay' | null>(null);

  // State for transaction history tabs
  const [activeTab, setActiveTab] = useState<'completed' | 'processing' | 'failed'>('completed');

  // Hook for safe area insets (for notch/status bar handling)
  const insets = useSafeAreaInsets();

  // Reanimated shared values for animations
  const tabIndicatorTranslateX = useSharedValue(0); // Tracks position of the tab indicator
  const [tabWidth, setTabWidth] = useState(0); // State to store calculated tab width

  // Effect to calculate initial total balance and load dummy data
  useEffect(() => {
    const calculatedBalance = DUMMY_TRANSACTIONS.reduce((sum, t) => {
      if (t.status === 'completed') {
        return sum + t.amount;
      }
      return sum;
    }, 0);
    setTotalBalance(-100); // Setting to -100 for testing negative balance UI
    setTransactions(DUMMY_TRANSACTIONS.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    const dummySavedDetails: BankDetails = {
      accountHolderName: 'Priya Sharma',
      accountNumber: 'XXXX XXXX XXXX 5678',
      ifscCode: 'ICIC0000123',
      bankName: 'ICICI Bank',
      upiId: 'priyasharma@upi',
      phonePeNumber: '9876543210',
      googlePayNumber: '9876543210',
    };
    if (dummySavedDetails) {
      setHasBankDetails(true);
      setSavedBankDetails(dummySavedDetails);
    }
  }, []);

  // Effect to animate the tab indicator when activeTab changes, and to recalculate tabWidth
  useEffect(() => {
    if (tabWidth === 0) return; // Wait until tabWidth is calculated

    let newPosition;
    switch (activeTab) {
      case 'completed':
        newPosition = 0;
        break;
      case 'processing':
        newPosition = tabWidth;
        break;
      case 'failed':
        newPosition = tabWidth * 2;
        break;
      default:
        newPosition = 0;
    }
    tabIndicatorTranslateX.value = withTiming(newPosition, { duration: 300 });
  }, [activeTab, tabWidth]); // Depend on tabWidth now

  // Handler to measure the layout of the segmented control to get accurate tab width
  const onSegmentedControlLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    // The segmentedControl has `p-1` (4px padding) on all sides.
    // The inner content width is `width - 2 * 4px`.
    // Then divide by 3 for the three tabs.
    const calculatedTabWidth = (width - 2 * 4) / 3;
    setTabWidth(calculatedTabWidth);
  };

  // Handle press on a transaction item to show details (remains the same)
  const handleTransactionPress = (item: Transaction) => {
    navigation.navigate('TransactionFullScreen', {
      transaction: item,
    });
  };

  // Handle initiation of withdrawal process (remains the same)
  const handleWithdrawFunds = () => {
    if (totalBalance <= 0) {
      Alert.alert('Insufficient Balance', 'You need a positive balance to withdraw funds.');
      return;
    }
    setAccountHolderName(savedBankDetails?.accountHolderName || '');
    setAccountNumber(savedBankDetails?.accountNumber || '');
    setIfscCode(savedBankDetails?.ifscCode || '');
    setBankName(savedBankDetails?.bankName || '');
    setUpiId(savedBankDetails?.upiId || '');
    setPhonePeNumber(savedBankDetails?.phonePeNumber || '');
    setGooglePayNumber(savedBankDetails?.googlePayNumber || '');
    setWithdrawalMethod(hasBankDetails ? 'bank' : null);
    setIsWithdrawModalVisible(true);
  };

  // Handle confirmation of withdrawal (remains the same)
  const handleConfirmWithdrawal = () => {
    if (!withdrawalMethod) {
      Alert.alert("Selection Needed", "Please select a withdrawal method.");
      return;
    }

    let paymentMode: Transaction['paymentMode'] = 'N/A';
    let isValid = false;

    if (withdrawalMethod === 'bank') {
      if (hasBankDetails && savedBankDetails) {
        paymentMode = 'Bank Account';
        isValid = true;
      } else if (accountHolderName && accountNumber && ifscCode && bankName) {
        paymentMode = 'Bank Account';
        isValid = true;
      } else {
        Alert.alert('Missing Details', 'Please fill in all bank account details.');
      }
    } else if (withdrawalMethod === 'upi') {
      if (upiId) {
        paymentMode = 'UPI';
        isValid = true;
      } else {
        Alert.alert('Missing Details', 'Please enter your UPI ID.');
      }
    } else if (withdrawalMethod === 'phonepe') {
      if (phonePeNumber && phonePeNumber.length === 10) {
        paymentMode = 'PhonePe';
        isValid = true;
      } else {
        Alert.alert('Missing Details', 'Please enter a valid 10-digit PhonePe number.');
      }
    } else if (withdrawalMethod === 'googlepay') {
      if (googlePayNumber && googlePayNumber.length === 10) {
        paymentMode = 'Google Pay';
        isValid = true;
      } else {
        Alert.alert('Missing Details', 'Please enter a valid 10-digit Google Pay number.');
      }
    }

    if (!isValid) return;

    const amountToWithdraw = totalBalance;
    if (amountToWithdraw <= 0) {
      Alert.alert('No Balance to Withdraw', 'Your current balance is zero or negative.');
      return;
    }

    Alert.alert(
      'Confirm Withdrawal',
      `You are about to withdraw ${formatCurrency(amountToWithdraw)}.\n\nMethod: ${paymentMode}\n\nIs this correct?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => {
            Alert.alert('Withdrawal Request Submitted!', 'Your request is being processed. Funds will be credited soon.');
            setIsWithdrawModalVisible(false);

            setTotalBalance(prevBalance => prevBalance - amountToWithdraw);
            const newTransaction: Transaction = {
              id: `WDR${Date.now().toString().slice(-6)}`,
              amount: -amountToWithdraw,
              date: new Date().toISOString().split('T')[0],
              type: 'withdrawal',
              description: `Withdrawal request via ${paymentMode}`,
              status: 'processing',
              paymentMode: paymentMode,
            };
            setTransactions(prev => [...prev, newTransaction].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setActiveTab('processing');
          },
        },
      ]
    );
  };

  // Handle payment of negative balance (remains the same)
  const handlePayAmount = () => {
    const amountToPay = Math.abs(totalBalance);
    if (amountToPay === 0) {
      Alert.alert('No Due Amount', 'Your balance is not negative.');
      return;
    }

    Alert.alert(
      'Pay Due Amount',
      `You need to pay ${formatCurrency(amountToPay)}.\n\nProceed to payment?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Proceed to Pay',
          onPress: () => {
            Alert.alert('Payment Initiated', 'Redirecting to secure payment gateway...');
            setTotalBalance(0);
            const newDeposit: Transaction = {
              id: `DEP${Date.now().toString().slice(-6)}`,
              amount: amountToPay,
              date: new Date().toISOString().split('T')[0],
              type: 'deposit',
              description: `Payment to clear negative balance`,
              status: 'completed',
              paymentMode: 'N/A',
            };
            setTransactions(prev => [...prev, newDeposit].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setActiveTab('completed');
          },
        },
      ]
    );
  };

  // Filter transactions based on the active tab (remains the same)
  const filteredTransactions = transactions.filter(t => t.status === activeTab);

  // Reanimated style for the tab indicator's horizontal translation
  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: tabIndicatorTranslateX.value }],
      width: tabWidth, // Use calculated width directly
    };
  });

  // Boolean to check if balance is not negative (remains the same)
  const isNoDue = totalBalance >= 0;

  // Component for the header of the FlatList (contains balance, buttons, and tab selection)
  const ListHeader = () => (
    <View className="px-4 pt-0">
      {/* Total Earnings Card */}
      <View
        style={styles.totalEarningsCard}
        className="rounded-xl p-6 mb-6 items-center justify-center mt-8"
      >
        <View
          className={`p-4 rounded-full mb-3`}
          style={{ backgroundColor: totalBalance >= 0 ? Colors.success + '15' : Colors.danger + '15' }}
        >
          <FontAwesomeIcon icon={faWallet} size={40} color={totalBalance >= 0 ? Colors.success : Colors.danger} />
        </View>
        <Text className="text-base font-semibold mt-1" style={{ color: Colors.textSecondary }}>Total Balance</Text>
        <Text className={`text-5xl font-semibold mt-1`} style={{ color: totalBalance >= 0 ? Colors.success : Colors.danger, letterSpacing: -0.5 }}>
          {formatCurrency(totalBalance)}
        </Text>
        {totalBalance < 0 && (
          <View className="flex-row items-center mt-3 px-4 py-2 rounded-full border" style={{ backgroundColor: Colors.danger + '10', borderColor: Colors.danger + '30' }}>
            <FontAwesomeIcon icon={faInfoCircle} size={16} color={Colors.danger} />
            <Text className="text-xs ml-2 font-medium" style={{ color: Colors.danger }}>Negative balance. Please clear.</Text>
          </View>
        )}
      </View>

      {/* Action Buttons (Withdraw / Pay Due) */}
      <View className={`mb-6 ${isNoDue ? 'items-center' : 'flex-row justify-between gap-x-4'}`}>
        {totalBalance < 0 ? (
          <>
            <TouchableOpacity
              onPress={handleWithdrawFunds}
              style={[styles.actionButton, { flex: 0.5 }]}
              className="flex-row items-center justify-center py-5 rounded-xl"
              activeOpacity={0.75}
            >
              <View style={{ transform: [{ rotate: '180deg' }] }}>
                <FontAwesomeIcon icon={faArrowUpFromBracket} size={24} color={Colors.textPrimary} />
              </View>
              <Text className="text-lg font-semibold ml-3" style={{ color: Colors.textPrimary }}>Withdraw</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handlePayAmount}
              style={[styles.payAmountButton, { flex: 0.5, backgroundColor: Colors.black }]}
              className="flex-row items-center justify-center py-5 rounded-xl"
              activeOpacity={0.75}
            >
              <Text className="text-lg font-semibold" style={{ color: Colors.cardBackground }}>Pay Due</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            onPress={handleWithdrawFunds}
            style={[
              styles.actionButton,
              { width: '90%', backgroundColor: Colors.black, paddingVertical: 25 },
            ]}
            className="flex-row items-center justify-center rounded-xl"
            activeOpacity={0.75}
          >
            <View style={{ transform: [{ rotate: '180deg' }] }}>
              <FontAwesomeIcon icon={faArrowUpFromBracket} size={24} color={'white'} />
            </View>
            <Text className="text-lg font-bold ml-3" style={{ color: Colors.cardBackground }}>Withdraw</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Transaction History Section Header */}
      <View className="flex-row items-center justify-between mb-4 mt-2">
        <Text className="text-xl font-bold" style={{ color: Colors.textPrimary }}>Transaction History</Text>
        <FontAwesomeIcon icon={faMoneyBillTransfer} size={20} color={Colors.textSecondary} />
      </View>

      {/* Segmented Control for Transaction Tabs */}
      <View
        style={styles.segmentedControl}
        className="flex-row rounded-xl mb-4 p-1" // Keep p-1 here to apply padding to the whole container
        onLayout={onSegmentedControlLayout} // Add onLayout to capture width
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: Colors.accent,
              borderRadius: 10,
              margin: 4, // This margin matches the p-1 (4px) of the parent, ensuring the indicator fits
            },
            animatedIndicatorStyle,
          ]}
        />
        <TouchableOpacity
          className={`flex-1 items-center py-3 rounded-lg`} // flex-1 and items-center will center the text
          onPress={() => setActiveTab('completed')}
          activeOpacity={0.75}
        >
          <Text className={`text-base font-semibold`} style={{ color: activeTab === 'completed' ? Colors.cardBackground : Colors.textPrimary }}>Completed</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 items-center py-3 rounded-lg`} // flex-1 and items-center will center the text
          onPress={() => setActiveTab('processing')}
          activeOpacity={0.75}
        >
          <Text className={`text-base font-semibold`} style={{ color: activeTab === 'processing' ? Colors.cardBackground : Colors.textPrimary }}>Processing</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 items-center py-3 rounded-lg`} // flex-1 and items-center will center the text
          onPress={() => setActiveTab('failed')}
          activeOpacity={0.75}
        >
          <Text className={`text-base font-semibold`} style={{ color: activeTab === 'failed' ? Colors.cardBackground : Colors.textPrimary }}>Failed</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render a single transaction item (remains the same)
  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    let icon: IconDefinition;
    let iconColor: string;
    let amountTextColor: string;

    if (item.status === 'processing') {
      icon = faHourglassHalf;
      iconColor = Colors.warning;
      amountTextColor = Colors.warning;
    } else if (item.status === 'failed') {
      icon = faCircleExclamation;
      iconColor = Colors.danger;
      amountTextColor = Colors.danger;
    } else if (item.type === 'earning' || item.type === 'deposit') {
      icon = faReceipt;
      iconColor = Colors.success;
      amountTextColor = Colors.success;
    } else { // For 'withdrawal' and 'penalty'
      icon = faReceipt;
      iconColor = Colors.danger;
      amountTextColor = Colors.danger;
    }

    return (
      <TouchableOpacity
        onPress={() => handleTransactionPress(item)}
        style={styles.transactionCard}
        className="flex-row items-center justify-between p-4 mb-3 rounded-xl"
        activeOpacity={0.75}
      >
        <View className="flex-row items-center flex-1">
          <FontAwesomeIcon icon={icon} size={20} color={iconColor} />
          <View className="ml-3 flex-1">
            <Text className="font-semibold text-base" style={{ color: Colors.textPrimary }} numberOfLines={1} ellipsizeMode="tail">
              {item.description}
            </Text>
            <Text className="text-xs mt-1" style={{ color: Colors.textSecondary }}>
              {new Date(item.date).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>
        <Text className="font-bold text-lg" style={{ color: amountTextColor }}>
          {formatCurrency(item.amount)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      {/* FIXED HEADER - Styled to match AddTripScreen header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: Platform.OS === 'android' ? (StatusBar?.currentHeight || 0) : screenHeight * 0.02,
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
         <Text style={{ fontSize: 20, fontWeight: '700', color: 'black', flex: 1, textAlign: 'center' }}>
          Earnings
        </Text>
      </View>

      {/* Main content of the screen */}
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransactionItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <Animated.View entering={FadeIn} exiting={FadeOut} className="items-center justify-center p-8 mt-10">
            <FontAwesomeIcon icon={faInfoCircle} size={40} color={Colors.textSecondary} />
            <Text className="text-base text-center mt-4" style={{ color: Colors.textSecondary }}>
              No {activeTab} transactions found.
            </Text>
          </Animated.View>
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 20, paddingHorizontal: 20, }}
        showsVerticalScrollIndicator={false}
      />

      {/* Withdrawal Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isWithdrawModalVisible}
        onRequestClose={() => setIsWithdrawModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent} className="rounded-2xl p-6">
            <TouchableOpacity onPress={() => setIsWithdrawModalVisible(false)} className="absolute top-4 right-4">
              <FontAwesomeIcon icon={faTimes} size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
            <Text className="text-2xl font-bold mb-6 text-center" style={{ color: Colors.textPrimary }}>Withdraw Funds</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Withdrawal Method Selection */}
              <Text className="text-base font-semibold mb-3" style={{ color: Colors.textPrimary }}>Select Withdrawal Method:</Text>
              <View className="flex-row flex-wrap justify-between mb-4">
                <TouchableOpacity
                  className={`flex-row items-center p-3 rounded-lg border mb-2 w-[48%] ${withdrawalMethod === 'bank' ? 'bg-black border-black' : 'bg-gray-100 border-gray-300'}`}
                  onPress={() => setWithdrawalMethod('bank')}
                >
                  <FontAwesomeIcon icon={faBuildingColumns} size={20} color={withdrawalMethod === 'bank' ? Colors.cardBackground : Colors.textPrimary} />
                  <Text className={`ml-2 text-sm font-medium ${withdrawalMethod === 'bank' ? 'text-white' : 'text-textPrimary'}`}>Bank Account</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-row items-center p-3 rounded-lg border mb-2 w-[48%] ${withdrawalMethod === 'upi' ? 'bg-black border-black' : 'bg-gray-100 border-gray-300'}`}
                  onPress={() => setWithdrawalMethod('upi')}
                >
                  <FontAwesomeIcon icon={faMoneyCheckDollar} size={20} color={withdrawalMethod === 'upi' ? Colors.cardBackground : Colors.textPrimary} />
                  <Text className={`ml-2 text-sm font-medium ${withdrawalMethod === 'upi' ? 'text-white' : 'text-textPrimary'}`}>UPI</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-row items-center p-3 rounded-lg border mb-2 w-[48%] ${withdrawalMethod === 'phonepe' ? 'bg-black border-black' : 'bg-gray-100 border-gray-300'}`}
                  onPress={() => setWithdrawalMethod('phonepe')}
                >
                  <FontAwesomeIcon icon={faMobileScreenButton} size={20} color={withdrawalMethod === 'phonepe' ? Colors.cardBackground : Colors.textPrimary} />
                  <Text className={`ml-2 text-sm font-medium ${withdrawalMethod === 'phonepe' ? 'text-white' : 'text-textPrimary'}`}>PhonePe</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-row items-center p-3 rounded-lg border mb-2 w-[48%] ${withdrawalMethod === 'googlepay' ? 'bg-black border-black' : 'bg-gray-100 border-gray-300'}`}
                  onPress={() => setWithdrawalMethod('googlepay')}
                >
                  <FontAwesomeIcon icon={faMobileScreenButton} size={20} color={withdrawalMethod === 'googlepay' ? Colors.cardBackground : Colors.textPrimary} />
                  <Text className={`ml-2 text-sm font-medium ${withdrawalMethod === 'googlepay' ? 'text-white' : 'text-textPrimary'}`}>Google Pay</Text>
                </TouchableOpacity>
              </View>

              {/* Dynamic Input Fields based on Withdrawal Method */}
              {withdrawalMethod === 'bank' && (
                <>
                  <Text className="text-base font-semibold mt-2 mb-2" style={{ color: Colors.textPrimary }}>Bank Account Details:</Text>
                  {hasBankDetails && savedBankDetails ? (
                    <View className="bg-gray-100 p-3 rounded-lg mb-3 border border-gray-300">
                      <Text className="text-sm text-gray-700"><Text className="font-semibold">Account Holder:</Text> {savedBankDetails.accountHolderName}</Text>
                      <Text className="text-sm text-gray-700"><Text className="font-semibold">Account Number:</Text> {savedBankDetails.accountNumber}</Text>
                      <Text className="text-sm text-gray-700"><Text className="font-semibold">IFSC Code:</Text> {savedBankDetails.ifscCode}</Text>
                      <Text className="text-sm text-gray-700"><Text className="font-semibold">Bank Name:</Text> {savedBankDetails.bankName}</Text>
                    </View>
                  ) : (
                    <>
                      <TextInput
                        className="border border-gray-300 rounded-lg px-4 py-3 mb-3 text-base"
                        placeholder="Account Holder Name"
                        placeholderTextColor={Colors.textPlaceholder}
                        value={accountHolderName}
                        onChangeText={setAccountHolderName}
                      />
                      <TextInput
                        className="border border-gray-300 rounded-lg px-4 py-3 mb-3 text-base"
                        placeholder="Bank Account Number"
                        placeholderTextColor={Colors.textPlaceholder}
                        keyboardType="numeric"
                        value={accountNumber}
                        onChangeText={setAccountNumber}
                      />
                      <TextInput
                        className="border border-gray-300 rounded-lg px-4 py-3 mb-3 text-base"
                        placeholder="IFSC Code"
                        placeholderTextColor={Colors.textPlaceholder}
                        autoCapitalize="characters"
                        maxLength={11}
                        value={ifscCode}
                        onChangeText={setIfscCode}
                      />
                      <TextInput
                        className="border border-gray-300 rounded-lg px-4 py-3 mb-3 text-base"
                        placeholder="Bank Name"
                        placeholderTextColor={Colors.textPlaceholder}
                        value={bankName}
                        onChangeText={setBankName}
                      />
                    </>
                  )}
                </>
              )}

              {withdrawalMethod === 'upi' && (
                <>
                  <Text className="text-base font-semibold mt-2 mb-2" style={{ color: Colors.textPrimary }}>UPI ID:</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 mb-3 text-base"
                    placeholder="e.g., yourname@bankupi"
                    placeholderTextColor={Colors.textPlaceholder}
                    keyboardType="email-address" // UPI IDs can look like emails
                    autoCapitalize="none"
                    value={upiId}
                    onChangeText={setUpiId}
                  />
                </>
              )}

              {(withdrawalMethod === 'phonepe' || withdrawalMethod === 'googlepay') && (
                <>
                  <Text className="text-base font-semibold mt-2 mb-2" style={{ color: Colors.textPrimary }}>
                    {withdrawalMethod === 'phonepe' ? 'PhonePe Number:' : 'Google Pay Number:'}
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 mb-3 text-base"
                    placeholder="10-digit mobile number"
                    placeholderTextColor={Colors.textPlaceholder}
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={withdrawalMethod === 'phonepe' ? phonePeNumber : googlePayNumber}
                    onChangeText={withdrawalMethod === 'phonepe' ? setPhonePeNumber : setGooglePayNumber}
                  />
                </>
              )}

              <Text className="text-base font-semibold mt-4 mb-2" style={{ color: Colors.textPrimary }}>Amount to Withdraw:</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base font-bold text-center"
                value={formatCurrency(totalBalance)}
                editable={false} // Amount is read-only
                style={{ backgroundColor: Colors.primaryBg, color: Colors.textPrimary }}
              />
            </ScrollView>

            <TouchableOpacity
              className="bg-black py-4 rounded-xl items-center"
              onPress={handleConfirmWithdrawal}
            >
              <Text className="text-white font-bold text-lg">Confirm Withdrawal</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  totalEarningsCard: {
    backgroundColor: Colors.cardBackground,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButton: {
    backgroundColor: Colors.cardBackground,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  payAmountButton: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  segmentedControl: {
    backgroundColor: Colors.cardBackground,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  transactionCard: {
    backgroundColor: Colors.cardBackground,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: Colors.cardBackground,
    width: '90%',
    maxHeight: '80%',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
});

export default EarningsScreen;