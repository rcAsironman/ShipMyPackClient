// src/screens/auth/ForgotPasswordScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  ActivityIndicator,
  Image,
} from 'react-native';
import CountryPicker, {
  Country,
  CountryCode,
  CountryModalProvider,
} from 'react-native-country-picker-modal';
import Toast from 'react-native-toast-message';
import { useFirebaseOTP } from '../../hooks/useFirebaseOTP';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [mobile, setMobile] = useState('');
  const [previousMobile, setPreviousMobile] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState<CountryCode>('IN');
  const [country, setCountry] = useState<Country>({
    cca2: 'IN',
    callingCode: ['91'],
    currency: ['INR'],
    flag: '🇮🇳',
    name: 'India',
    region: 'Asia',
    subregion: 'Southern Asia',
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [timer, setTimer] = useState(0);
  const [otpSent, setOtpSent] = useState(false);

  const { sendOTP, verifyCode, error, verificationInProgress } = useFirebaseOTP();
  const otpRefs = Array.from({ length: 6 }, () => useRef<TextInput>(null));

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0 && otpSent) {
      setOtpSent(false);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  const handleOtpChange = (val: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    if (val && index < 5) otpRefs[index + 1].current?.focus();
    else if (index === 5) Keyboard.dismiss();
  };

  const handleOtpKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        otpRefs[index - 1].current?.focus();
      }
    }
  };

  const onSelect = (selected: Country) => {
    setCountry(selected);
    setCountryCode(selected.cca2);
    setPickerVisible(false);
  };

  const handleSendOtp = async () => {
    Keyboard.dismiss();
    const rawMobile = mobile.trim();
    const callingCode = country.callingCode[0];
    const phoneNumber = `+${callingCode}${rawMobile}`;

    if (rawMobile !== previousMobile) {
      setOtpSent(false);
      setTimer(0);
    }

    if (!callingCode || rawMobile.length < 8) {
      Toast.show({ type: 'error', text1: 'Invalid Mobile Number' });
      return;
    }

    try {
      const success = await sendOTP(phoneNumber);
      if (success) {
        setPreviousMobile(rawMobile);
        setOtpSent(true);
        setTimer(120);
        setOtp(['', '', '', '', '', '']);
        otpRefs[0].current?.focus();
        Toast.show({
          type: 'success',
          text1: 'OTP Sent',
          text2: `Code sent to ${phoneNumber}`,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      Toast.show({ type: 'error', text1: 'Enter 6-digit OTP' });
      return;
    }

    try {
      const success = await verifyCode(code);
      if (success) {
        Toast.show({ type: 'success', text1: 'OTP Verified' });
        navigation.navigate('ResetPassword', { mobile });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <CountryModalProvider>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-white"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
            <View className="px-6 sm:px-10 md:px-16 bg-white">
              <Image
                source={require('../../../assets/logo.png')}
                className="mb-6 self-center"
                style={{ width: 100, height: 100, resizeMode: 'contain' }}
              />
              <Text className="text-3xl font-extrabold mb-6 text-center text-airbnb-primary">
                Forgot Password
              </Text>

              <TouchableOpacity
                className="mb-4 border border-airbnb-secondary rounded-2xl bg-white p-3 flex-row items-center justify-between"
                onPress={() => setPickerVisible(true)}
              >
                <CountryPicker
                  countryCode={countryCode}
                  withFilter
                  withFlag
                  withCountryNameButton
                  withCallingCode
                  withEmoji
                  withModal
                  visible={isPickerVisible}
                  onClose={() => setPickerVisible(false)}
                  onSelect={onSelect}
                />
                <Text className="text-base ml-2">
                  {country?.callingCode ? `+${country.callingCode[0]}` : ''}
                </Text>
              </TouchableOpacity>

              <TextInput
                style={{ textAlignVertical: 'center', fontWeight: '400' }}
                className="border border-airbnb-secondary rounded-2xl px-4 py-3 mb-6 text-lg shadow-sm bg-white text-black"
                placeholder="Enter Mobile Number"
                placeholderTextColor={'gray'}
                keyboardType="phone-pad"
                value={mobile}
                onChangeText={setMobile}
                editable={!verificationInProgress}
              />

              <TouchableOpacity
                onPress={handleSendOtp}
                className={`h-14 justify-center px-5 mb-6 rounded-full shadow-md bg-airbnb-secondary ${
                  verificationInProgress ? 'opacity-50' : ''
                }`}
                disabled={verificationInProgress}
              >
                {verificationInProgress ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white text-center font-semibold">Send OTP</Text>
                )}
              </TouchableOpacity>

              {otpSent && (
                <>
                  <View className="flex-row justify-center mb-4">
                    {otp.map((digit, index) => (
                      <View key={index} className="mx-1">
                        <TextInput
                          ref={otpRefs[index]}
                          value={digit}
                          maxLength={1}
                          keyboardType="number-pad"
                          onChangeText={(val) => handleOtpChange(val, index)}
                          onKeyPress={(e) => handleOtpKeyPress(e, index)}
                          className="border w-12 h-12 text-center text-xl font-semibold rounded-xl border-airbnb-accent bg-white shadow-sm"
                        />
                      </View>
                    ))}
                  </View>

                  <View className="mb-6">
                    {timer > 0 ? (
                      <Text className="text-center text-airbnb-secondary">
                        Resend OTP in {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                      </Text>
                    ) : (
                      <TouchableOpacity onPress={handleSendOtp}>
                        <Text className="text-airbnb-primary text-center font-medium">Resend Code</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={handleVerifyOtp}
                    className="h-14 bg-airbnb-primary justify-center px-5 rounded-full shadow-md mb-6"
                  >
                    <Text className="text-white text-center font-semibold text-lg">Verify OTP</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </CountryModalProvider>
  );
}
