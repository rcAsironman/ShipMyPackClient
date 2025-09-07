import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'

const AboutUs = ({navigation}:{navigation: any}) => {
  const insets = useSafeAreaInsets()
  const top = insets.top

  return (
    <View
      className="bg-white flex-1"
      style={{
        paddingTop: top,
        paddingHorizontal: 20,
        paddingBottom: 20,
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity className="p-2" 
          onPress={() => {
            navigation.goBack();
          }}
          >
            <FontAwesomeIcon icon={faChevronLeft} size={22} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-bold ml-4">About Us</Text>
        </View>

        {/* Body */}
        <View className='mt-8'>
          <Text className="text-[20px] font-semibold mb-4">
            At ShipMyPack, we’re redefining the way packages move across cities.
          </Text>

          <Text className="text-base text-gray-700 leading-relaxed mb-4">
            Our platform connects people who want to send packages with trusted
            travelers already heading in the same direction. By leveraging
            existing travel routes, we make deliveries faster, safer, and more
            affordable.
          </Text>

          <Text className="text-base text-gray-700 leading-relaxed mb-4">
            Whether you’re a sender looking for a reliable way to deliver your
            package, or a traveler wanting to earn on your trip, ShipMyPack
            makes it simple with secure payments, verified trips, and OTP-based
            confirmations.
          </Text>

          <Text className="text-base text-gray-700 leading-relaxed mb-4">
            Our mission is to build a community-driven delivery network where
            trust, transparency, and convenience come first. With ShipMyPack,
            every trip has the potential to create value — for both senders and
            travelers.
          </Text>

          <Text className="text-base text-gray-700 leading-relaxed font-medium">
            Join us in shaping the future of peer-to-peer logistics in India.
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

export default AboutUs
