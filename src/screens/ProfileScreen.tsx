import { Modal, View, Text, Platform, StatusBar, Dimensions, TouchableOpacity, Image, ScrollView, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faClose, faMoneyBill, faTicket } from '@fortawesome/free-solid-svg-icons';
import ViewProfileImageModal from '../components/ViewProfileImageModal';
import { paymentInfoType, paymentDetails } from '../types/types';
import PaymentMethodModal from '../components/PaymentMethodModal';
import { useBankInfoStore } from '../store/bankInfo';
import CuponsModal from '../components/CuponsModal';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');



const ProfileScreen = () => {
  const [viewProfileImg, setViewProfileImg] = useState<boolean>(false);
  const [profileImg, setprofileImg] = useState<string | null>("https://avatar.iran.liara.run/public/8");
  const [paymentmodalVisible, setPaymentModalVisible] = useState<boolean>(false);
  const [cuponModalVisible, setCuponModalvisible] = useState<boolean>(false);
  const bankDataFromstore = useBankInfoStore((state) => state.bankDetails)
  const [paymentDetails, setPaymentDetails] = useState<paymentInfoType>(bankDataFromstore ? bankDataFromstore : {
    upiId: null,
    bankName: null,
    bankaccountNumber: null,
    ifscCode: null
  });



  useEffect(() => {
    
  },[])


  {/*close profile View modal*/}
  const closeProfileViewModal = () => {
    setViewProfileImg(false);
  }

  const updatePaymentMethod = () => {
    setPaymentModalVisible(true)
  }

  const showCupons = () => {
    setCuponModalvisible(true);
  }


  //payment icons and methods

  const paymentInfo: paymentDetails[] = [
    { id: 1, icon: faMoneyBill, label: 'Payment Info', method: updatePaymentMethod },
    { id: 2, icon: faTicket, label: 'Cupons', method: showCupons },
  ]

  const updateProfileImage = () => {

    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 1
      },
      (response) => {

        if (response.didCancel) {
          Toast.show({
            type: 'info',
            text1: 'Cancelled',
            text2: 'you cancelled the image selection',
            position: 'bottom',
            visibilityTime: 3000
          })
        }
        else if (response.errorCode) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: response.errorMessage || 'something went wrong!',
            position: 'bottom',
            visibilityTime: 3000
          })
        }
        else if (response.assets && response.assets.length > 0) {
          const selectedImage = response.assets[0];
          setprofileImg(selectedImage.uri || null);
          Toast.show({
            type: 'success',
            text1: 'Profile Updated',
            text2: 'Profile image Updated Successfully',
            position: 'bottom',
            visibilityTime: 3000
          })

        }
      }
    )

  }

  return (
    <View  className='bg-gray-100' style={{ flex: 1,}}>
      {/*Header*/}
      <View
        className='
      w-full
      bg-white
      h-[100px]
      flex-row
      items-center
      justify-center
      '
        style={{
          paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : screenHeight * 0.06
        }}
      >
        <Text className='text-2xl font-bold'>Profile</Text>
      </View>

      {/*
      Profile Image and details
      */}
      <ScrollView>
        <View
          className='
      w-full
      flex-row
      gap-10
      items-center
      px-8
      mt-8
      '
        >

          <View>
            <TouchableOpacity
              className='
          w-28
          h-28
          rounded-full
          bg-gray-800
          '
              onPress={() => setViewProfileImg(true)}
            >
              <Image
                source={{ uri: profileImg! }}
                style={{
                  height: '100%',
                  width: '100%',
                  borderRadius: 100
                }}
              />
            </TouchableOpacity>
          </View>
          <View
            className='
        gap-2
        '
          >
            <Text className='font-semibold text-xl'>{"karthik"}</Text>
            <Text className='font-semibold'>{"9347606XXX"}</Text>
          </View>
        </View>

        {/*Payment*/}
        <View className='mt-10 ml-8'>
          <Text className='text-xl '>PAYMENT AND COUPONS</Text>
          {
            paymentInfo.map((item) => (
              <TouchableOpacity className='mt-2 flex-row items-center py-2' key={item?.id}
              onPress={item?.method}
              >
                <View className='h-10 w-10 bg-gray-200 rounded-full justify-center items-center'>
                  <FontAwesomeIcon icon={item?.icon} />
                </View>
                <Text className='ml-4 font-semibold'>{item?.label}</Text>
              </TouchableOpacity>
            ))
          }
        </View>
      </ScrollView>

      <ViewProfileImageModal 
      viewProfileImg={viewProfileImg} 
      closeingIcon={faClose}
      profileImg={profileImg}
      updateProfileImage={updateProfileImage}
      closeProfileViewModal={closeProfileViewModal}
      />

      <PaymentMethodModal
      paymentModalVisible={paymentmodalVisible}
      setPaymentModalVisible={setPaymentModalVisible}
      paymentDetails={paymentDetails}
      setPaymentDetails={setPaymentDetails}
      />

      <CuponsModal
      isVisible={cuponModalVisible}
      setCuponModalvisible={setCuponModalvisible}
      />
    </View>
  )
}

export default ProfileScreen