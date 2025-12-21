import React, { useState } from "react";
import { View, TouchableOpacity, KeyboardAvoidingView, Platform, TextInput, TextInputBase } from "react-native";
import Modal from "react-native-modal";
import { ScrollView } from 'react-native-gesture-handler';
import Text from "./Text";

const PayNegativeBalance = ({ currentNegativeBalance, setCloseModal, isModalVisible, upiInfo }
    : { currentNegativeBalance: number, setCloseModal: React.Dispatch<React.SetStateAction<boolean>>, isModalVisible: boolean, upiInfo: string | null }) => {

    const [upiId, setUpiId] = useState<string | null>(null);
    return (
        <Modal
            isVisible={isModalVisible}
            swipeDirection={'down'}
            onSwipeComplete={() => setCloseModal(false)}
            propagateSwipe={true}
            style={{
                margin: 0,
                justifyContent: 'flex-end',
            }}
        >
            <View className="h-[75%] bg-white rounded-lg">
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
                        <View className="p-4">
                            <Text className="text-lg font-bold mb-4">Pay Negative Balance</Text>
                            <Text className="text-base mb-2">Your current negative balance is <Text className="text-red-500">₹{currentNegativeBalance.toFixed(2)}</Text>. Please clear this balance to continue using our services.</Text>
                            {upiInfo ? (
                                <View className="mt-4">
                                    <Text className="text-base font-semibold mb-2">UPI ID:</Text>
                                    <Text className="text-base">{upiInfo}</Text>
                                </View>
                            ) : (<>
                                <TextInput
                                    value={upiId!}
                                    onChangeText={setUpiId}
                                    placeholder="Enter your UPI ID"
                                    className="mt-4 text-lg mb-4 border-b pb-2 tracking-[2px]"
                                />
                            </>)}
                            <TouchableOpacity
                                onPress={() => {
                                    // Logic to initiate payment
                                }}
                                className="bg-black py-3 px-6 rounded-full mt-6 items-center"
                            >
                                <Text className="text-white text-lg font-semibold">Pay Now</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setCloseModal(false)}
                                className="bg-gray-300 py-3 px-6 rounded-full mt-4 items-center"
                            >
                                <Text className="text-black text-lg font-semibold">Cancel</Text>
                            </TouchableOpacity>
                        </View>

                    </ScrollView>

                </KeyboardAvoidingView>
            </View>
        </Modal>
    )
}


export default PayNegativeBalance;