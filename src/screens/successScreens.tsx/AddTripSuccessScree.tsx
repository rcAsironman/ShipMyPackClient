import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import LottieView from 'lottie-react-native'

const AddTripSuccessScree = ({navigation}: {navigation: any}) => {

    useEffect(() => {
    const timer = setTimeout(() => {
      // Navigate to the main screen after 3 seconds
      // Assuming you have a navigation prop available
      navigation.navigate('MainTabs');
    }, 3000);

    return () => clearTimeout(timer); // Cleanup the timer on unmount
    }, [])
  return (
    <View
    style={{ flex: 1, justifyContent: 'center', alignItems: 'center' } }
    className='bg-wgite'
    >
      <LottieView
        source={require('../../../assets/addTripSuccess.json')}
        autoPlay
        loop={true}
        style={{ width: 300, height: 200 }}
        />
       <Text className='text-green-900 font-semibold text-2xl'>Trip Added Successfully!</Text>
    </View>
  )
}

export default AddTripSuccessScree