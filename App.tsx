import 'react-native-gesture-handler'; // ✅ must be first
import { enableScreens } from 'react-native-screens';
enableScreens();                        // ✅ improves navigation performance
import './src/config/firebaseConfig'
import React, { useEffect } from 'react';
import RootNavigator from './src/navigation/RootNavigator';
import './global.css';                 // ✅ for NativeWind v4
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SocketProvider } from './src/context/SocketProvider';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import AdvertisementPopup from './src/components/AdvertisementPopup';
import axios from 'axios';
import { ENDPOINTS } from './src/constants/constants';

type AdvertisementPopupProps = {
  id: string,
  title: string,
  description: string,
  image_url: string,
  redirect_url: string,
  is_active: boolean,
}

export default function App() {

  const [showAd, setShowAd] = useState(false);
  const [advertisement, setAdvertisement] = useState<AdvertisementPopupProps | null>(null);


  const handleAdvertisementInitialFetch = async () => {

    try {
      const response = await axios.get(ENDPOINTS.ADVERTISEMENT);
      const id = response.data[0].id;
      const title = response.data[0].title;
      const description = response.data[0].description;
      const image_url = response.data[0].image_url;
      const redirect_url = response.data[0].redirect_url;
      const is_active = response.data[0].is_active;

      const ad: AdvertisementPopupProps = {
        id,
        title,
        description,
        image_url,
        redirect_url,
        is_active
      };
      setAdvertisement(ad);
      setShowAd(true)
    }
    catch (error) {

    }

  }
  useEffect(() => {
    handleAdvertisementInitialFetch()



  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SocketProvider>
        {showAd && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)', // translucent white
              zIndex: 1000,
            }}
          >
            <AdvertisementPopup
              imageUrl={advertisement?.image_url ?? ''}
              linkUrl={advertisement?.redirect_url?? ''}
              onClose={() => setShowAd(false)}
            />
          </View>
        )}
        <RootNavigator />
      </SocketProvider>
    </GestureHandlerRootView>
  );
}