import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faChevronLeft, faTrash } from '@fortawesome/free-solid-svg-icons'

const PrivacyPolicy = ({ navigation }: { navigation: any }) => {
  const insets = useSafeAreaInsets()
  const top = insets.top

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => {
          // TODO: API call to delete account
          console.log("Account Deleted")
        }},
      ]
    )
  }

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
          onPress={() => navigation.goBack()}
          >
            <FontAwesomeIcon icon={faChevronLeft} size={22} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-bold ml-4">Privacy Policy</Text>
        </View>

        {/* Body */}
        <View>
          <Text className="text-base text-gray-700 leading-relaxed mb-4">
            At ShipMyPack, your privacy and trust are our top priorities. We are
            committed to protecting your personal data and ensuring it is used
            only for providing and improving our delivery services.
          </Text>

          <Text className="text-base text-gray-700 leading-relaxed mb-4">
            We collect limited information such as your name, contact details,
            and trip history to connect you with trusted senders and travelers.
            Your data will never be sold to third parties, and it is stored
            securely in compliance with industry standards.
          </Text>

          <Text className="text-base text-gray-700 leading-relaxed mb-4">
            You have full control over your data. If you no longer wish to use
            ShipMyPack, you can permanently delete your account and all
            associated data.
          </Text>

          <Text className="text-base text-gray-700 leading-relaxed font-medium">
            By using our services, you agree to this policy. For further
            assistance, please contact our support team.
          </Text>
        </View>

        {/* Delete Account */}
        <View className="mt-10">
          <TouchableOpacity
            onPress={handleDeleteAccount}
            className="bg-red-500 rounded-2xl py-4 flex-row items-center justify-center shadow-md"
          >
            <FontAwesomeIcon icon={faTrash} size={18} color="white" />
            <Text className="text-white font-semibold text-base ml-2">
              Delete My Account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

export default PrivacyPolicy
