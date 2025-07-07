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
  const [showAd, setShowAd] = useState(false);
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
              onPress={() => { navigation.navigate('ShipNowScreen'); setShowAd(true); }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Ship Now</Text>
            </TouchableOpacity>

            <Text className='mt-12 text-2xl font-bold'>Available Shipments for your Trip</Text>

            {/*display available shipments*/}
            <AvailableShipments
              count={dummyShipmentData.count}
              startingPoint={dummyShipmentData.startingPoint}
              destination={dummyShipmentData.destination}
              travelDate={dummyShipmentData.travelDate}
              travelTime={dummyShipmentData.travelTime}
              tripDays={dummyShipmentData.tripDays}
              onPressViewAll={handleViewAllShipments}
            />

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
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default HomeScreen;