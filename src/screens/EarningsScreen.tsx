import { View, Text, SectionList, TouchableOpacity, Dimensions, Animated, Alert } from 'react-native';
import React, { useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { transactions } from '../data/transaction';
import FastImage from 'react-native-fast-image';
import { useBankInfoStore } from '../store/bankInfo';
import Toast from 'react-native-toast-message';
import WithdrawModal from '../components/WithdrawModal';
import PayNegativeBalance from '../components/PayNegativeBalance';



type tabType = 'completed' | 'processing' | 'failed';

const EarningsScreen = () => {
  const { top } = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = useState<tabType>('completed');
  const tabs = ['completed', 'processing', 'failed'];
  const translateX = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width;
  const bankDetails = useBankInfoStore((state) => state.bankDetails);
  const [payemtFullScreenModal, setPaymentFullScreenModal] = useState<boolean>(false);
  const [amountToWithdraw, setAmountToWithdraw] = useState<number>(0);
  const [negativePayemtFullScreenModal, setNegativePaymentFullScreenModal] = useState<boolean>(false);
  const [currentAccountBalance, setCurrentAccountBalance] = useState<number>(-1500);
  const filteredTransactions =
    selectedTab === 'completed'
      ? transactions.filter((txn) => txn.status === 'completed')
      : selectedTab === 'processing'
        ? transactions.filter((txn) => txn.status === 'pending')
        : transactions.filter((txn) => txn.status === 'failed');

  const currencySymbol = '₹'

  const handlePayNegativeBalance = () => {
    setNegativePaymentFullScreenModal(true);
  }

  const handleWithdraw = () => {
    if(bankDetails?.bankaccountNumber !== null || bankDetails.upiId !== null){
       setPaymentFullScreenModal(true);
    }
    else{
      Toast.show({
        type: 'info',
        text1: 'Add Payment Method',
        text2: 'Please add a payment method in Profile to withdraw earnings.',
        position: 'top',
        visibilityTime: 4000,
      })
    }
  }
  const handleTabPress = (tab: tabType, index: number) => {
    setSelectedTab(tab);

    Animated.spring(translateX, {
      toValue: (screenWidth / tabs.length) * index,
      useNativeDriver: true,
    }).start();

  }

  const Card = () => {
    return (
      <View
        className='h-64 w-[90%] bg-red-400 self-center mt-4 rounded-xl'
        style={{
          elevation: 5,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowOffset: {
            width: 4,
            height: 6,
          },
        }}>
        <View className='flex-row justify-between p-4 items-center'>
          {/* Company Name */}
          <Text className='text-3xl font-bold ml-2 mt-2'>SHIPMYPACK</Text>
          <View className='bg-white rounded-full p-[2px]'>
            <FastImage
              source={require('/Users/kmangineni/Downloads/ShipMyPackClient/assets/logorbg.png')}
              style={{
                height: 40,
                width: 40,
              }}
            />
          </View>
        </View>

        <View className='bg-black h-14 mt-6'></View>
        <View
          className='self-start flex-row justify-between w-full px-4 items-center'
          style={{
            position: 'absolute',
            bottom: 20,
          }}>
          <View>
            {/* Balance */}
            <Text className='text-lg font-semibold'>Balance</Text>
            <Text className='text-lg font-semibold' style={{ color: 'white' }}>
              {currencySymbol}{currentAccountBalance}/-
            </Text>
          </View>

          <View>
            {/* Member since */}
            <Text className='text-lg font-semibold'>Member since</Text>
            <Text className='text-lg font-semibold' style={{ color: 'white' }}>
              21-12-2025
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const WithdrawButton = () => {
    return (
      <View className='mt-4 mb-8'>
        <TouchableOpacity className='flex items-center justify-center rounded-lg bg-black py-4 w-[90%] self-center'
        onPress={currentAccountBalance > 0 ? handleWithdraw : handlePayNegativeBalance}
        >
          <Text className='text-xl font-semibold' style={{ color: 'white' }}>
           {currentAccountBalance > 0 ? ' Withdraw' : 'Pay Now'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const Tabs = () => {


    return <View className='bg-gray-100 h-16 w-full flex-row '>
      <Animated.View
        className='rounded-full'
        style={{
          transform: [{ translateX }],
          position: 'absolute',
          backgroundColor: 'black',
          height: '60%',
          width: screenWidth / tabs.length - 20,
          bottom: 10,
          left: 10
        }}
      />

      {
        tabs.map((tab, index) => (
          <TouchableOpacity
            key={tab}
            onPress={() => handleTabPress(tab as tabType, index)}
            style={{
              width: screenWidth / tabs.length,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text className='text-lg font-semibold'
              style={{
                color: selectedTab === tab ? 'white' : 'black',
              }}
            >{tab}</Text>
          </TouchableOpacity>
          ))
      }
    </View>
  };

  // Define the sections for SectionList
  const sections = [
    {
      title: 'completed', // This title can be anything, it's just a key for the section
      data: filteredTransactions,

    },
  ];

  const renderItem = ({ item }: { item: typeof transactions[0] }) => (
    <View className='p-4 border-b border-gray-200' key={item.orderId}>
      <View className='flex-row items-center justify-between'>
        <Text className='text-lg font-semibold'>{item.orderId}</Text>
        <Text className='text-gray-400'>Date: {item.date}</Text>
      </View>

      <View className='flex-row items-center justify-between mt-2'>
        <Text className='text-gray-600 text-lg font-semibold'>{currencySymbol}{item.amount.toFixed(2)}</Text>
        <View className={`${item.status === 'completed' ? 'bg-green-100' : item.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'}
     h-8  justify-center rounded-full px-4
     `}
        >
          <Text
            className={`text-sm font-medium ${item.status === 'completed'
              ? 'text-green-600'
              : item.status === 'pending'
                ? 'text-yellow-600'
                : 'text-red-600'
              }`}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View className='flex-1'>
      {/* Header */}
      <View
        className='
          w-full
          bg-white
          h-[13.5%]
          flex-row
          items-center
          justify-center
        '
        style={{
          shadowColor: '#000',
          paddingTop: top,
          shadowOpacity: 0.2,
          shadowOffset: {
            width: 0,
            height: 2,
          },
        }}>
        <Text className='text-2xl font-bold'>Earnings</Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.orderId + index}
        renderItem={renderItem}
        // This is where your tabs will be rendered as a sticky header
        renderSectionHeader={() => <Tabs />}
        // These components will be rendered at the very top of the list, before the sticky header
        ListHeaderComponent={() => (
          <>
            <Card />
            <WithdrawButton />
          </>
        )}
        renderSectionFooter={() => <TouchableOpacity className='bg-airbnb-primary py-4 items-center w-[90%] rounded-full mb-4 self-center mt-4'>
          <Text className='text-white text-xl'>Load More</Text>
        </TouchableOpacity>} // Add some space at the bottom
      />

   <WithdrawModal 
      currentAccountBalance={currentAccountBalance} 
      isModalVisible={payemtFullScreenModal} 
      bankInfo={bankDetails} 
      setWithdrawModal={setPaymentFullScreenModal}
      />
      <PayNegativeBalance
      currentNegativeBalance={currentAccountBalance}
      setCloseModal={setNegativePaymentFullScreenModal}
      isModalVisible={negativePayemtFullScreenModal}
      upiInfo={bankDetails?.upiId || null}
      />
      <Toast />
    </View>
  );
};

export default EarningsScreen;