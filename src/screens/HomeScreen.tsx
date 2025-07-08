import React, { useState, useEffect } from 'react';
import { StatusBar, View, Text, Image, TouchableOpacity, ScrollView, Dimensions, Platform, Animated, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageCarousel from '../components/ImageCarousel';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faHeadset, height } from '@fortawesome/free-solid-svg-icons/faHeadset'
import { faBell } from '@fortawesome/free-solid-svg-icons';
import AdvertisementPopup from '../components/AdvertisementPopup';
import axios from 'axios';
import { ENDPOINTS } from '../constants/constants';
import { useSocket } from '../context/SocketProvider';
import AvailableShipments from '../components/AvailableShipments';
import LottieView from 'lottie-react-native';

// import AvailableShipments from '../components/AvailableShipments';

const { width } = Dimensions.get('window');


interface CarouselItem {
  id: number;
  uri: string;
}



// Carousel configuration
const HomeScreen = ({ navigation }: { navigation: any }) => {
  const socket = useSocket();
  const userName = 'Karthik';
  const earnings = 1234;
  const [carouselImages, setCarouselImages] = useState<CarouselItem[]>([]);


  const fetchCarouselData = async () => {
    try {
      const response = await axios.get(ENDPOINTS.CAROUSEL); // Replace with your API endpoint
      console.log('Carousel data fetched:', response.data);
      // Handle the carousel data as needed
      const images = response.data.map((item: any) => ({ id: item.id, uri: item.image_url }));
      setCarouselImages(images);

    }
    catch (error) {
      console.error('Error fetching carousel data:', error);
    }
  }

  const handleCarouselCreate = (data: any) => {
    setCarouselImages(prevImages => [
      ...prevImages,
      { id: data.data.id, uri: data.data.image_url }  // ✅ append the new image
    ]);
  };

  const handleCarouselDelete = (data: any) => {
    setCarouselImages(prevImages => prevImages.filter(image => image.id !== data.data.id)); // ✅ remove the deleted image
  }


  useEffect(() => {
    fetchCarouselData(); // Initial fetch only

    socket.on('carouselCreate', handleCarouselCreate);
    socket.on('carouselDeleted', handleCarouselDelete);
    return () => {
      socket.off('carouselCreate', handleCarouselCreate);
    };
  }, []);

  const dummyShipmentData = {
    count: 7, // Replace with actual count
    startingPoint: 'Hyderabad',
    destination: 'Bengaluru',
    travelDate: '2025-07-20', // Example: July 20, 2025
    travelTime: '10:00 AM',
    tripDays: 3,
  };

  const handleViewAllShipments = () => {
    // Navigate to the screen that shows all available shipments
    navigation.navigate('AllShipmentsScreen'); // Replace with your actual screen name
    console.log('View All Shipments pressed!');
  };


  return (
    <>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: 'white',
          paddingTop: Platform.OS === 'android' ? 0 : 0,
        }}
        edges={['right']}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 0,
            paddingTop: height * 0.05,
            paddingHorizontal: 16,
            height: height * 0.22, // or use a fixed height like h-[12%]
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
              <FontAwesomeIcon icon={faBell} size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('SupportScreen')}
            >
              <FontAwesomeIcon size={24} color="black" icon={faHeadset} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 20
          }}
        >
          <Animated.ScrollView
            style={{ flex: 1, backgroundColor: 'white' }}
            contentContainerStyle={{
              paddingHorizontal: 20,
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
            {carouselImages?.length > 0 ? (
              <ImageCarousel imagesData={carouselImages} />
            ) : (
              <View style={{ height: 0, justifyContent: 'center', alignItems: 'center' }}>

              </View>
            )}



            {/* Ship Now Section */}
            <Text style={{ marginTop: 32, fontSize: 20, fontWeight: '700', marginBottom: 30 }}>
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
              onPress={() => { navigation.navigate('ShipNowScreen'); }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Ship Now</Text>
            </TouchableOpacity>
              <View className='mt-14'></View>
            {/*display available shipments*/}
            <AvailableShipments
              shipmentCount={dummyShipmentData.count}
              destinationLocation={dummyShipmentData.destination}
              estimatedTripDays={dummyShipmentData.tripDays}
              originLocation={dummyShipmentData.startingPoint}
              travelDate={dummyShipmentData.travelDate}
              travelTime={dummyShipmentData.travelTime}
              onViewAllPress={()=> {navigation.navigate('AllShipmentsScreen');}}
            />

            <View className='mt-[52px]'>
              <View style={{display: 'flex', flexDirection: 'row',}}>
              <Text style={{ fontSize: 68, fontWeight: '800' }} className='text-gray-200'>Love  </Text>
              <LottieView source={require('../../assets/heartSmile.json')} autoPlay loop style={{ height: 100, width: 200, marginLeft: -50}}/>
              </View>
              <Text style={{ fontSize: 78, fontWeight: '800' }} className='text-gray-200'>Shipping</Text>
              <Text style={{ fontSize: 29, fontWeight: '800' }} className='text-gray-200 mt-8'>ShipMyPack</Text>
            </View>
          </Animated.ScrollView>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default HomeScreen;