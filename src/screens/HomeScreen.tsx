import React, { useState } from 'react';
import { StatusBar, View, Text, Image, TouchableOpacity, ScrollView, Dimensions, Platform, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ImageCarousel from '../components/ImageCarousel';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faHeadset } from '@fortawesome/free-solid-svg-icons/faHeadset'
import AdvertisementPopup from '../components/AdvertisementPopup';
const { width } = Dimensions.get('window');

// Carousel configuration
const HomeScreen = ({ navigation }: { navigation: any }) => {
  const userName = 'Karthik';
  const earnings = 1234;
  const [showAd, setShowAd] = useState(false);

  return (
    <>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <SafeAreaView style={{
        flex: 1,
        backgroundColor: 'white', // or 'bg-airbnb-primary'
        elevation: 5,
      }}
        edges={['top']}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
            paddingHorizontal: 16,
            height: 70, // or use a fixed height like h-[12%]
            backgroundColor: 'white',
            elevation: 5, // Android
            shadowColor: '#000', // iOS
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            zIndex: 10,
          }}
          className="shadow-md"
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={require('../../assets/logorbg.png')} style={{ width: 45, height: 45 }} />
            <Text style={{ fontSize: 20, fontWeight: '700', marginLeft: 10, color: 'black' }}>ShipMyPack</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate('NotificationScreen')}
            >
              <Ionicons name="notifications-outline" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
            onPress={() => navigation.navigate('SupportScreen')}
            >
            <FontAwesomeIcon size={24} color="black" icon={faHeadset} />
            </TouchableOpacity>
          </View>
        </View>
        <Animated.ScrollView
          style={{ flex: 1, backgroundColor: 'white' }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: Platform.OS === 'ios' ? 40 : 20,
            paddingBottom: 200,
          }}
          bounces={true} // ✅ Enables stretching on iOS
          overScrollMode="always" // ✅ Enables stretching on Android
          scrollEventThrottle={16}
        >
          {/* Welcome and Earnings */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
            <View>
              <Text style={{ fontSize: 22, fontWeight: '600' }}>Hi,</Text>
              <Text style={{ fontSize: 22, fontWeight: '600' }}>{userName} 👋</Text>
            </View>
            <View>
              <Text style={{ fontWeight: '600', color: '#000', textAlign: 'right' }}>Earnings</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: 'green', textAlign: 'right' }}>₹{earnings}</Text>
            </View>
          </View>

          {/* Carousel */}
          <ImageCarousel />


          {/* Ship Now Section */}
          <Text style={{ marginTop: 32, fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
            Would you like to Ship a packet?
          </Text>
          <TouchableOpacity
            style={{
              paddingVertical: 14,
              borderRadius: 12,
              alignSelf: 'center',
              width: '90%',
              alignItems: 'center',
            }}
            className="bg-airbnb-primary"
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Ship Now</Text>
          </TouchableOpacity>

          <View className='mt-[52px]'>
            <Text style={{ fontSize: 68, fontWeight: '800' }} className='text-gray-200'>Love  ❤️</Text>
            <Text style={{ fontSize: 78, fontWeight: '800' }} className='text-gray-200'>Shipping</Text>

          </View>
        </Animated.ScrollView>
        {showAd && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)', // translucent white
              zIndex: 999,
            }}
          >
            <AdvertisementPopup
              imageUrl="https://images.pexels.com/photos/93398/pexels-photo-93398.jpeg?_gl=1*ylvtz6*_ga*NDA5MTg1NTIzLjE3NTAzMTAwOTk.*_ga_8JE65Q40S6*czE3NTAzMTAwOTkkbzEkZzEkdDE3NTAzMTAxMDckajUyJGwwJGgw"
              linkUrl="https://your-link.com"
              onClose={() => setShowAd(false)}
            />
          </View>
        )}
      </SafeAreaView>
    </>
  );
};

export default HomeScreen;
