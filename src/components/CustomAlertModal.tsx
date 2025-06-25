import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  TouchableOpacity,
  Animated,
} from 'react-native';

interface CustomAlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: {
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }[];
  onClose: () => void;
}

const CustomAlertModal: React.FC<CustomAlertModalProps> = ({
  visible,
  title,
  message,
  buttons,
  onClose,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        className="flex-1 justify-center items-center bg-black/50 px-6"
      >
        <Animated.View
          className="bg-white rounded-2xl px-6 py-8 w-full max-w-md shadow-lg"
          style={{ opacity: fadeAnim }}
          onStartShouldSetResponder={() => true}
        >
          <Text className="text-xl font-bold text-center text-neutral-900 mb-3">
            {title}
          </Text>

          <Text className="text-base text-neutral-600 text-center mb-6 leading-relaxed">
            {message}
          </Text>

          {buttons.length === 1 ? (
            <TouchableOpacity
              className="bg-[#FF5A5F] py-3 rounded-xl items-center"
              activeOpacity={0.85}
              onPress={() => {
                onClose();
                buttons[0].onPress();
              }}
            >
              <Text className="text-white font-semibold text-base">
                {buttons[0].text}
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row justify-between">
              {buttons.map((btn, idx) => {
                const bg =
                  btn.style === 'cancel'
                    ? 'bg-gray-200'
                    : btn.style === 'destructive'
                    ? 'bg-red-600'
                    : 'bg-[#FF5A5F]';

                const textColor =
                  btn.style === 'cancel' ? 'text-black' : 'text-white';

                return (
                  <TouchableOpacity
                    key={idx}
                    className={`flex-1 py-3 rounded-xl items-center ${bg} ${
                      idx === 0 ? 'mr-2' : 'ml-2'
                    }`}
                    activeOpacity={0.85}
                    onPress={() => {
                      onClose();
                      btn.onPress();
                    }}
                  >
                    <Text className={`text-base font-semibold ${textColor}`}>
                      {btn.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default CustomAlertModal;
