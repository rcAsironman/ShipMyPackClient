import { View, Text, Modal, TouchableOpacity} from 'react-native'
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import FastImage from 'react-native-fast-image'

interface profileModalProps{
    viewProfileImg: boolean,
    closeingIcon: any,
    profileImg: string | null,
    updateProfileImage: () => void,
    closeProfileViewModal: () => void

}
const ViewProfileImageModal = ({viewProfileImg, closeingIcon, profileImg, updateProfileImage, closeProfileViewModal}:profileModalProps) => {


  return (
    <Modal
    visible={viewProfileImg}
    animationType={'slide'}
    onRequestClose={closeProfileViewModal}
  >
    <View className='
    h-full
    w-full
    bg-black
    items-center
    justify-center
    '>
      <TouchableOpacity
        className='
      h-8
      w-8
      bg-white
      absolute
      top-10
      left-5
      z-10
      rounded-full
      items-center
      justify-center
      '
        onPress={closeProfileViewModal}
      >
        <FontAwesomeIcon icon={closeingIcon} size={25} color={'black'} />
      </TouchableOpacity>

      <View
        className='
       h-[200px]
       w-[200px]

       '
      >
        <FastImage
          source={{ 
            uri: profileImg!,
            priority: FastImage.priority.high,
            cache: FastImage.cacheControl.immutable
          }}
          style={{
            height: '100%',
            width: '100%',
            borderRadius: 100

          }}
        />
      </View>

      {/*Edit option for adding a new image*/}
      <TouchableOpacity
        className='
      w-[90%]
      h-[40px]
      bg-white
      absolute
      bottom-20
      items-center
      justify-center
      rounded-md
      '
        onPress={updateProfileImage}
      >
        <Text className='text-small font-semibold'>Change Profile</Text>
      </TouchableOpacity>
    </View>
  </Modal>
  )
}

export default ViewProfileImageModal