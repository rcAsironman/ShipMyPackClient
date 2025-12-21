import { View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { paymentInfoType } from '../types/types';
import Text from './Text';
import Modal from 'react-native-modal';
import Toast from 'react-native-toast-message';
import { faBank, faEdit, faForward, faPen, faTrash, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { ScrollView } from 'react-native-gesture-handler';
import CustomToast from './CustomToast';
import { useBankInfoStore } from '../store/bankInfo';


interface paymentprops {
    paymentModalVisible: boolean,
    setPaymentModalVisible: React.Dispatch<React.SetStateAction<boolean>>,
    paymentDetails: paymentInfoType,
    setPaymentDetails: React.Dispatch<React.SetStateAction<paymentInfoType>>,

}
const PaymentMethodModal = ({ paymentModalVisible, setPaymentModalVisible, paymentDetails, setPaymentDetails }: paymentprops) => {


    const [isUpiIdEmpty, setIsUpiIdEmpty] = useState<boolean>((paymentDetails.upiId != null) ? false : true);
    const [isBankDataEmpty, setIsBankDataEmpty] = useState<boolean>(paymentDetails.bankaccountNumber != '' || paymentDetails.bankaccountNumber !== null ? false : true);
    const setBankDetailsToStore = useBankInfoStore((state) => state.setBankDetails);

    useEffect(() => {
        if (paymentDetails.upiId === null) {
            setIsUpiIdEmpty(true);
        }
        if (paymentDetails.bankaccountNumber === null) {
            setIsBankDataEmpty(true);
        }

    }, [paymentDetails])

    const handleSave = () => {
        if (paymentDetails.upiId !== null) {
            setIsUpiIdEmpty(false);
        }
        if (paymentDetails.bankaccountNumber !== null || paymentDetails.bankName !== null || paymentDetails.ifscCode !== null) {
            setIsBankDataEmpty(false);
        }

        setBankDetailsToStore(paymentDetails);
        Toast.show({
            type: 'success',
            text1: 'Payment details saved successfully',
            position: 'bottom',
            visibilityTime: 2000,
        });
    }


    const handleDelete = (bankOrUpi: number) => {

        let updateData = {...paymentDetails};

        if(bankOrUpi === 1){
            //upi
            setIsUpiIdEmpty(true);
            updateData.upiId = null;
        }
        else if (bankOrUpi === 2){
            //bank
            setIsBankDataEmpty(true);
            updateData.bankaccountNumber = null;
            updateData.bankName = null;
            updateData.ifscCode = null;
        }
        setBankDetailsToStore(updateData);
    }

    return (
        <Modal
            isVisible={paymentModalVisible}
            swipeDirection={'down'}
            onSwipeComplete={() => setPaymentModalVisible(false)}
            propagateSwipe={true}
            style={{
                margin: 0,
                justifyContent: 'flex-end',
            }}
        >


            <View className=' bg-gray-100  w-full rounded px-4' style={{height: '70%'}}>
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
                        showsVerticalScrollIndicator={false}

                    >
                        <Text className='text-xl font-semibold mt-6 mb-8'>Update Your Payemt Details Here</Text>
                        {
                            !isUpiIdEmpty ? (
                                <View className='border-[1px] p-4 bg-white-100 rounded-[10px]'>
                                    <View className='flex-row items-center gap-2'>
                                        <View className='bg-blue-200 h-10 w-10 justify-center items-center rounded-full'>
                                            <FontAwesomeIcon icon={faForward} size={20} color='black' />
                                        </View>
                                        <Text className='text-lg font-semibold'>UPI</Text>
                                    </View>

                                    <View className='flex-row items-center justify-between'>
                                        <Text className='mt-2 text-lg font-semibold'>{paymentDetails.upiId}</Text>
                                        <View className='flex-row items-center justify-evenly w-1/3'>
                                            <TouchableOpacity className='bg-gray-200 h-10 w-10 justify-center items-center rounded-full -ml-6'
                                            onPress={() => setIsUpiIdEmpty(true)}
                                            >
                                                <FontAwesomeIcon icon={faPen} size={15} color='black' />
                                            </TouchableOpacity>
                                            <TouchableOpacity className='bg-gray-200 h-10 w-10 justify-center items-center rounded-full -mr-8'
                                                onPress={() => {
                                                    setPaymentDetails({ ...paymentDetails, upiId: null });
                                                    handleDelete(1);
                                                    Toast.show({
                                                        type: 'error',
                                                        text1: 'UPI Id Deleted Successfully',
                                                        position: 'bottom',
                                                        visibilityTime: 2000,
                                                    });
                                                }
                                                }
                                            >
                                                <FontAwesomeIcon icon={faTrashCan} size={16} color={'#FF000D'} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>)
                                : (<View>
                                    <Text className='text-xl mb-4 font-[600]'>Enter UPI Id</Text>
                                    <TextInput
                                        placeholder='987654321022@ybl'
                                        value={paymentDetails.upiId!}
                                        onChangeText={(text) => setPaymentDetails({ ...paymentDetails, upiId: text })}
                                        className='border-b border-gray-400 py-2 text-lg'
                                    />
                                    <TouchableOpacity
                                        className='h-[40px] w-[90%] justify-center items-center mt-8 self-center rounded-[8px]'
                                        disabled={paymentDetails.upiId?.length === 0 || paymentDetails.upiId === null}
                                        onPress={handleSave}
                                        style={{
                                            backgroundColor: paymentDetails.upiId?.length === 0 || paymentDetails.upiId === null ? 'gray' : 'black'
                                        }}
                                    >
                                        <Text className='text-lg font-semibold'

                                            style={{
                                                color: paymentDetails.upiId?.length === 0 || paymentDetails.upiId === null ? 'balck' : 'white'
                                            }}
                                        >save</Text>
                                    </TouchableOpacity>
                                </View>)
                        }
                        {
                            isBankDataEmpty && isUpiIdEmpty && (
                                <View className='flex-row items-center mt-8'>
                                    <View className="border border-gray-300 rounded-md border-dashed flex-row w-[45%] h-[1px]"></View>
                                    <Text className='text-gray-300 text-2xl px-2'>or</Text>
                                    <View className="border border-gray-300 rounded-md border-dashed flex-row w-[45%] h-[1px]"></View>

                                </View>
                            )
                        }
                        {/*Bank details*/}
                        {
                            !isBankDataEmpty ? (
                                <View className='border-[1px] p-4 bg-white-100 rounded-[10px] mt-10'
                                
                                >
                                    <View className='flex-row items-center gap-2'>
                                        <View className='bg-green-200 h-10 w-10 justify-center items-center rounded-full'>
                                            <FontAwesomeIcon icon={faBank} size={20} color='black' />
                                        </View>
                                        <Text className='text-lg font-semibold'>Bank</Text>
                                    </View>

                                    <View className='flex-row items-center justify-between'>
                                        <View>
                                            <Text className='mt-2 text-lg font-semibold'>{paymentDetails.bankName}</Text>
                                            <Text className='mt-2 text-lg font-semibold'>{paymentDetails.bankaccountNumber}</Text>
                                            <Text className='mt-2 text-lg font-semibold'>{paymentDetails.ifscCode}</Text>
                                        </View>
                                        <View className='flex-row items-center justify-evenly w-1/3'>
                                            <TouchableOpacity className='bg-gray-200 h-10 w-10 justify-center items-center rounded-full -ml-6'
                                            onPress={() => setIsBankDataEmpty(true)}
                                            >
                                                <FontAwesomeIcon icon={faPen} size={15} color='black' />
                                            </TouchableOpacity>
                                            <TouchableOpacity className='bg-gray-200 h-10 w-10 justify-center items-center rounded-full -mr-8'
                                                onPress={() => {
                                                    setPaymentDetails({ ...paymentDetails, bankaccountNumber: null, bankName: null, ifscCode: null });
                                                    handleDelete(2);
                                                    Toast.show({
                                                        type: 'error',
                                                        text1: 'Bank Details Deleted Successfully',
                                                        position: 'bottom',
                                                        visibilityTime: 2000,
                                                    });
                                                }
                                                }
                                            >
                                                <FontAwesomeIcon icon={faTrashCan} size={16} color={'#FF000D'} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>)
                                : (<View className='mt-14'>
                                    <Text className='text-xl mb-4 font-[600]'>Enter Bank Details</Text>
                                    <TextInput
                                        placeholder='Bank Name Eg: HDFC Bank'
                                        value={paymentDetails.bankName!}
                                        onChangeText={(text) => setPaymentDetails({ ...paymentDetails, bankName: text })}
                                        className='border-b border-gray-400 py-2 text-lg mb-4'
                                    />
                                    <TextInput
                                        placeholder='Account Number'
                                        value={paymentDetails.bankaccountNumber!}
                                        onChangeText={(text) => setPaymentDetails({ ...paymentDetails, bankaccountNumber: text })}
                                        className='border-b border-gray-400 py-2 text-lg mb-4'
                                    />
                                    <TextInput
                                        placeholder='IFSC Code Eg: HDFC0001234'
                                        value={paymentDetails.ifscCode!}
                                        onChangeText={(text) => setPaymentDetails({ ...paymentDetails, ifscCode: text })}
                                        className='border-b border-gray-400 py-2 text-lg'
                                    />
                                    <TouchableOpacity
                                        className='h-[40px] w-[90%] justify-center items-center mt-8 self-center rounded-[8px]'
                                        disabled={paymentDetails.bankName?.length === 0 || paymentDetails.bankName === null || paymentDetails.bankaccountNumber?.length === 0 || paymentDetails.bankaccountNumber === null || paymentDetails.ifscCode?.length === 0 || paymentDetails.ifscCode === null}
                                        onPress={handleSave}
                                        style={{
                                            backgroundColor: paymentDetails.bankName?.length === 0 || paymentDetails.bankName === null || paymentDetails.bankaccountNumber?.length === 0 || paymentDetails.bankaccountNumber === null || paymentDetails.ifscCode?.length === 0 || paymentDetails.ifscCode === null ? 'gray' : 'black'
                                        }}
                                    >
                                        <Text className='text-lg font-semibold'

                                            style={{
                                                color: paymentDetails.bankName?.length === 0 || paymentDetails.bankName === null || paymentDetails.bankaccountNumber?.length === 0 || paymentDetails.bankaccountNumber === null || paymentDetails.ifscCode?.length === 0 || paymentDetails.ifscCode === null ? 'balck' : 'white'
                                            }}
                                        >save</Text>
                                    </TouchableOpacity>
                                </View>)
                        }
                        <Text className='text-gray-300 mt-10 '>Note: Please enter valid UPI/Bank Details. Once the payment is initiated from our end, we cannot refund it.</Text>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
            <CustomToast/>
        </Modal>
    )
}

export default PaymentMethodModal