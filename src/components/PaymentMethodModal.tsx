import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { paymentInfoType } from '../types/types'

import Modal from 'react-native-modal';
import Toast from 'react-native-toast-message';
import { faEdit, faForward, faPen, faTrash, faTrashCan } from '@fortawesome/free-solid-svg-icons';



interface paymentprops {
    paymentModalVisible: boolean,
    setPaymentModalVisible: React.Dispatch<React.SetStateAction<boolean>>,
    paymentDetails: paymentInfoType,
    setPaymentDetails: React.Dispatch<React.SetStateAction<paymentInfoType>>,

}
const PaymentMethodModal = ({ paymentModalVisible, setPaymentModalVisible, paymentDetails, setPaymentDetails }: paymentprops) => {


    const [isUpiIdEmpty, setIsUpiIdEmpty] = useState<boolean>(paymentDetails.upiId ? true : false)
    return (
        <Modal
            isVisible={paymentModalVisible}
            swipeDirection={'down'}
            onSwipeComplete={() => setPaymentModalVisible(false)}
            style={{
                margin: 0,
                justifyContent: 'flex-end',
            }}
        >


            <View className='h-[750px] bg-gray-100  w-full rounded px-4'>
                {/*drag pointer*/}
                <View className='h-2 w-8 bg-gray-500 self-center mt-2 rounded'></View>

                <Text className='text-xl font-semibold mt-6 mb-8'>Update Your Payemt Details Here</Text>
                {
                    isUpiIdEmpty ? (
                        <View className='border-2 p-4 border-blue-300 rounded-[10px]'>
                            <View className='bg-blue-200 h-10 w-10 justify-center items-center rounded-full'>
                                <FontAwesomeIcon icon={faForward} size={20} color='black' />
                            </View>
                            <View className='flex-row items-center justify-between'>
                                <Text className='mt-2 text-lg font-semibold'>UPI ID: {paymentDetails.upiId}</Text>
                                <View className='flex-row items-center justify-evenly w-1/3'>
                                    <TouchableOpacity className='bg-gray-200 h-10 w-10 justify-center items-center rounded-full -ml-6'>
                                        <FontAwesomeIcon icon={faPen} size={15} color='black' />
                                    </TouchableOpacity>
                                    <TouchableOpacity className='bg-gray-200 h-10 w-10 justify-center items-center rounded-full -mr-8'>
                                        <FontAwesomeIcon icon={faTrashCan} size={16} color={'#FF000D'} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            </View>)
                            : (<View>
                                <Text className='text-xl '>Enter UPI Id: {paymentDetails.upiId!}</Text>
                                <TextInput
                                    placeholder='987654321022@ybl'
                                    value={paymentDetails.upiId!}
                                    onChangeText={(text) => setPaymentDetails({ ...paymentDetails, upiId: text })}
                                    className='border-b border-gray-400 py-2 text-lg'
                                />
                                <Text className='text-gray-300 mt-4'>Note: Please enter a valid UPI ID. Once the payment is initiated from our end, we cannot refund it.</Text>
                                <TouchableOpacity
                                    className='h-[40px] w-[90%] justify-center items-center mt-8 self-center rounded-[8px]'
                                    disabled={paymentDetails.upiId?.length === 0 || paymentDetails.upiId === null}
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
                        </View>
        </Modal>
    )
}

export default PaymentMethodModal