import { Alert, TouchableOpacity, View, TextInput, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import Modal from 'react-native-modal';
import Text from './Text';
import { paymentInfoType } from '../types/types';
import { ScrollView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import CustomToast from './CustomToast';

const WithdrawModal = ({ currentAccountBalance, isModalVisible, bankInfo, setWithdrawModal }: { currentAccountBalance: number, isModalVisible: boolean, bankInfo: paymentInfoType | null, setWithdrawModal: React.Dispatch<React.SetStateAction<boolean>> }) => {


  const bankDetails = bankInfo;
  const [paymentMethodsAvailable, setPaymentMethodsAvailable] = useState<null | 1 | 2 | 3>(null)
  const [selectedPaymentMethod, setselectedPaymentMethod] = useState<null | 1 | 2>(null);
  const [withdrawlamount, setwithdrawlamount] = useState<string>(currentAccountBalance.toString());
  const [invalidAmount, setInvalidAmount] = useState<boolean>(false);

  useEffect(() => {
    if (bankDetails?.bankaccountNumber !== null && bankDetails?.upiId !== null) {
      setPaymentMethodsAvailable(3);
      setselectedPaymentMethod(2);
    }
    else if (bankDetails?.bankaccountNumber === null && bankDetails?.upiId !== null) {
      setPaymentMethodsAvailable(2);
      setselectedPaymentMethod(2);
    }
    else if (bankDetails?.bankaccountNumber !== null && bankDetails?.upiId === null) {
      setPaymentMethodsAvailable(1);
      setselectedPaymentMethod(1);
    }
    else {
      setPaymentMethodsAvailable(null);
    }

  }, [bankDetails])


  useEffect(() => {
   if(isModalVisible){
    if ( currentAccountBalance > 10 && Number(withdrawlamount) > currentAccountBalance) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Amount',
        text2: `You cannot withdraw more than your current balance of ₹${currentAccountBalance}`,
        position: 'top',
      });
      setInvalidAmount(true);
    }
    else if (Number(withdrawlamount) < 10) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Amount',
        text2: `Minimum withdrawal amount is ₹10`,
        position: 'top',
      });
      setInvalidAmount(true);
    }
    else {
      setInvalidAmount(false);
    }
   }
  }, [withdrawlamount])

  const handleSelectPaymentMethod = (method: 1 | 2) => {
    setselectedPaymentMethod(method);
  }


  const  handleWithdraw = () => {

  }

  return (
    <Modal
      isVisible={isModalVisible}
      swipeDirection={'down'}
      onSwipeComplete={() => setWithdrawModal(false)}
      propagateSwipe={true}
      style={{
        margin: 0,
        justifyContent: 'flex-end',
      }}
    >

      <View style={{ height: '80%' }} className='bg-white w-full'>

        {/*drag pointer*/}
        <View className='h-2 w-8 bg-gray-500 self-center mt-2 rounded'></View>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 300 }}
            horizontal={false}
            showsVerticalScrollIndicator={true}

          >
            <Text className='font-bold mt-8 ml-4'>Enter amount to withdraw</Text>
            <TextInput
              placeholder={`${currentAccountBalance}`}
              className={`mt-4 ml-4 text-xl bg-gray-200 w-[93%] p-4 rounded ${invalidAmount && 'border border-red-500'}`}
              value={withdrawlamount.toString()}
              onChangeText={setwithdrawlamount}
              keyboardType='numeric'
            />
            <Text className='mt-2 ml-4 text-gray-300'>Min ₹{10} - Max ₹{currentAccountBalance}</Text>
            <Text className='font-bold mt-8 ml-4'>Select Payment Method</Text>
            {
              paymentMethodsAvailable === 3 ? (<>
                {/**Both Bank and UPI are available*/}
                <View className='mt-4 mx-4  h-[40%]'>

                  <Text className='font-semibold mt-8 mb-4'>UPI Details</Text>
                  <TouchableOpacity className={`p-4 flex-row items-center justify-between
        ${selectedPaymentMethod === 2 ? 'border border-green-400 bg-gray-200 rounded-xl' : ''}
        `}
                    onPress={() => handleSelectPaymentMethod(2)}
                  >

                    <View>
                      <Text>{bankDetails?.upiId}</Text>
                    </View>
                    {
                      selectedPaymentMethod === 2 && (
                        <View className='bg-green-400 px-4 py-2 rounded-full'>
                          <Text>selected</Text>
                        </View>
                      )
                    }
                  </TouchableOpacity>


                  <Text className='font-semibold mt-8 mb-4'>Bank Details</Text>
                  <TouchableOpacity className={`p-4  flex-row items-center justify-between
        ${selectedPaymentMethod === 1 ? 'border border-green-400 bg-gray-200 rounded-xl' : ''}
        `}
                    onPress={() => handleSelectPaymentMethod(1)}
                  >
                    <View>
                      <Text>{bankDetails?.bankName}</Text>
                      <Text className='mt-2'>ACC# {bankDetails?.bankaccountNumber}</Text>
                      <Text className='mt-2'>IFSC{bankDetails?.ifscCode}</Text>
                    </View>
                    {
                      selectedPaymentMethod === 1 && (
                        <View className='bg-green-400 px-4 py-2 rounded-full'>
                          <Text>selected</Text>
                        </View>
                      )
                    }
                  </TouchableOpacity>


                </View>
              </>) :
                paymentMethodsAvailable === 2 ? (<>

                  <View className='mt-4 mx-4'>
                    {/**Only UPI available*/}
                    <Text className='font-semibold mt-8 mb-4'>UPI Details</Text>
                    <TouchableOpacity className={`p-4 flex-row items-center justify-between
        ${selectedPaymentMethod === 2 ? 'border border-green-400 bg-gray-200 rounded-xl' : ''}
        `}
                      disabled={true}
                    >

                      <View>
                        <Text>{bankDetails?.upiId}</Text>
                      </View>
                      {
                        selectedPaymentMethod === 2 && (
                          <View className='bg-green-400 px-4 py-2 rounded-full'>
                            <Text>selected</Text>
                          </View>
                        )
                      }
                    </TouchableOpacity>
                  </View>
                </>) :
                  paymentMethodsAvailable === 1 ? (<>
                    {/**Only Bank details are available*/}
                    <View className='mt-4 mx-4'>
                      <Text className='font-semibold mt-8 mb-4'>Bank Details</Text>
                      <TouchableOpacity className={`p-4  flex-row items-center justify-between
        ${selectedPaymentMethod === 1 ? 'border border-green-400 bg-gray-200 rounded-xl' : ''}
        `}

                        disabled={true}
                      >
                        <View>
                          <Text>{bankDetails?.bankName}</Text>
                          <Text className='mt-2'>ACC# {bankDetails?.bankaccountNumber}</Text>
                          <Text className='mt-2'>IFSC{bankDetails?.ifscCode}</Text>
                        </View>
                        {
                          selectedPaymentMethod === 1 && (
                            <View className='bg-green-400 px-4 py-2 rounded-full'>
                              <Text>selected</Text>
                            </View>
                          )
                        }
                      </TouchableOpacity>
                    </View>
                  </>) : (<></>)
            }

            <View className='mt-24 mb-8'>
              <TouchableOpacity className='flex items-center justify-center rounded-lg bg-black py-4 w-[90%] self-center'
                onPress={handleWithdraw}
              >
                <Text className='text-xl font-semibold' style={{ color: 'white' }}>
                  Proceed
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
      <CustomToast />
    </Modal>
  )
}

export default WithdrawModal