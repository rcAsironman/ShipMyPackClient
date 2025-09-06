import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import Modal from 'react-native-modal';


type props = {
    isVisible: boolean;
    setCuponModalvisible: React.Dispatch<React.SetStateAction<boolean>>
}
const CuponCard = ({ code, description, expiry }: { code: string, description: string, expiry: string }) => {
    return (
        <View className='m-4 py-4 pl-4 bg-white rounded-lg'
            style={{
                shadowColor: "#000",
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
            }}
        >
            <View className='bg-blue-200 p-2 rounded-lg  self-start'>
                <Text className='text-xl font-semibold'>{code}</Text>
            </View>
            <View className='ml-1 mt-1 mb-4'>
                <Text className='text-sm text-gray-400'>Valid till: {expiry}</Text>
            </View>
            <Text className='text-lg text-gray-400'>{description}</Text>

        </View>
    )
}


const CuponsModal = ({ isVisible, setCuponModalvisible }: props) => {


    const cuponsData = [
        { id: 1, code: 'WELCOME10', description: 'Get 10% off on your first order', expiry: '2024-12-31' },
        { id: 2, code: 'FREESHIP', description: 'Free shipping on orders over $50', expiry: '2024-11-30' },
        { id: 3, code: 'SAVE20', description: 'Save $20 on orders over $100', expiry: '2024-10-15' },
        { id: 4, code: 'HOLIDAY15', description: '15% off during holiday season', expiry: '2024-12-25' },
        { id: 5, code: 'SPRING5', description: 'Get $5 off on spring collection', expiry: '2024-09-30' },
        { id: 6, code: 'SUMMER10', description: '10% off on summer collection', expiry: '2024-08-31' },
        { id: 7, code: 'FALL20', description: '20% off on fall collection', expiry: '2024-11-30' },
        { id: 8, code: 'WINTER25', description: '25% off on winter collection', expiry: '2024-12-31' },
        { id: 9, code: 'BIRTHDAY30', description: '30% off on your birthday', expiry: '2024-12-31' },
        { id: 10, code: 'LOYALTY15', description: '15% off for loyal customers', expiry: '2024-12-31' },
    ]



    return (<Modal
        isVisible={isVisible}
        swipeDirection={'down'}
        onSwipeComplete={() => setCuponModalvisible(false)}
        propagateSwipe={true}
        style={{
            margin: 0,
            justifyContent: 'flex-end',
        }}
    >
        <View style={{
            width: '100%',
            height: '80%',
            backgroundColor: 'white',
        }}>
            {/*drag pointer*/}
            <View className='h-2 w-8 bg-gray-500 self-center mt-2 rounded'></View>

            {/* Remove the fixed height from this View and add it to the ScrollView */}
            <View style={{ flex: 1 }}>
                <ScrollView
                    style={{ flex: 1 }} //👈 Add this to make the ScrollView fill the remaining space
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{
                        paddingBottom: 30,
                    }}
                    showsVerticalScrollIndicator={true}
                >
                    {
                        cuponsData.map((cupon) => (<CuponCard
                            key={cupon.id.toString()}
                            code={cupon.code}
                            description={cupon.description}
                            expiry={cupon.expiry}
                        />))
                    }
                </ScrollView>
            </View>
        </View>
    </Modal>
    )
}

export default CuponsModal