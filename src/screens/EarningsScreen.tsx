import { View, Text, SectionList, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { transactions } from '../data/transaction';
import FastImage from 'react-native-fast-image';

type tabType = 'completed' | 'processing' | 'failed';

const EarningsScreen = () => {
  const { top } = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = useState<tabType>('completed');

  const filteredTransactions =
    selectedTab === 'completed'
      ? transactions.filter((txn) => txn.status === 'completed')
      : selectedTab === 'processing'
      ? transactions.filter((txn) => txn.status === 'pending')
      : transactions.filter((txn) => txn.status === 'failed');

      const filteredTransactionsPro = transactions.filter((txn) => txn.status === 'pending');

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
              ₹1500/-
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
      <View className='mt-4'>
        <TouchableOpacity className='flex items-center justify-center rounded-lg bg-black py-4 w-[90%] self-center'>
          <Text className='text-xl font-semibold' style={{ color: 'white' }}>
            Withdraw
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const Tabs = () => {
    return <View className='bg-green-500 h-12 w-full'></View>;
  };

  // Define the sections for SectionList
  const sections = [
    {
      title: 'completed', // This title can be anything, it's just a key for the section
      data: filteredTransactions,

    },
    {
      title: 'processing', // This title can be anything, it's just a key for the section
      data: filteredTransactionsPro,

    },
  ];

  const renderItem = ({ item }: { item: typeof transactions[0] }) => (
    <View className='p-4 border-b border-gray-200'>
      <Text className='text-lg font-semibold'>{item.description}</Text>
      <Text className='text-gray-600'>Amount: ${item.amount.toFixed(2)}</Text>
      <Text className='text-gray-600'>Date: {item.date}</Text>
      <Text
        className={`text-sm font-medium ${
          item.status === 'completed'
            ? 'text-green-600'
            : item.status === 'pending'
            ? 'text-yellow-600'
            : 'text-red-600'
        }`}>
        Status: {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
      </Text>
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
      />
    </View>
  );
};

export default EarningsScreen;