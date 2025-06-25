// src/screens/auth/LoginScreen.tsx
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
  Image,
  ActivityIndicator, // For loading indicators
} from 'react-native';
import CountryPicker, {
  Country,
  CountryCode,
  CountryModalProvider,
} from 'react-native-country-picker-modal';
import Toast from 'react-native-toast-message';
// Corrected import path based on your screenshot
import { useFirebaseOTP } from '../../hooks/useFirebaseOTP';
import { useAuthStore } from '../../store/authStore';

// Dummy navigation prop type - replace with your actual navigation stack types if you have them
type LoginScreenProps = {
  navigation: {
    navigate: (screen: string) => void;
    // Add other navigation methods if you use them, e.g., goBack, replace
  };
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [mode, setMode] = useState<'otp' | 'password' | null>(null);
  const [mobile, setMobile] = useState('');
  const [previousMobile, setPreviousMobile] = useState<string | null>(''); // Track previous mobile number
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
  const [password, setPassword] = useState('');
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [timer, setTimer] = useState(0);
  const [otpSent, setOtpSent] = useState(false); // Tracks if OTP was successfully sent

  // Destructure the hook values
  const { sendOTP, verifyCode, error, verificationInProgress } = useFirebaseOTP();

  // Array of refs for OTP input fields for auto-focus
  const otpRefs = Array.from({ length: 6 }, () => useRef<TextInput>(null));

  // Get the login action from Zustand store
  const login = useAuthStore((state) => state.login);

  // Timer effect for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && otpSent) {
      // Timer finished, allow resending OTP
      setOtpSent(false); // Reset to false to enable resend button
    }
    return () => clearInterval(interval); // Cleanup on unmount or dependency change
  }, [otpSent, timer]);

  // Handle OTP digit changes and auto-focus
  const handleOtpChange = (val: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    if (val.length === 1) { // If a digit is entered
      if (index < otpRefs.length - 1) {
        otpRefs[index + 1].current?.focus(); // Move focus to next input
      } else {
        Keyboard.dismiss(); // If last digit, dismiss keyboard
      }
    }
  };

  // Handle backspace key press for OTP fields
  const handleOtpKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (otp[index] === '') {
        // If current input is empty, move focus to previous and clear it
        if (index > 0) {
          const newOtp = [...otp];
          newOtp[index - 1] = ''; // Clear previous digit
          setOtp(newOtp);
          otpRefs[index - 1].current?.focus();
        }
      } else {
        // If current input has a digit, clear it
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  // Handle country selection from picker
  const onSelect = (selectedCountry: Country) => {
    setCountryCode(selectedCountry.cca2);
    setCountry(selectedCountry);
    setPickerVisible(false); // Close modal after selection
  };

  // Handle sending OTP to the entered mobile number
  const handleSendOtp = async () => {
    if(Platform.OS === 'ios'){
      await login(); // Ensure user is logged in before sending OTP on iOS
    }
    Keyboard.dismiss(); // Dismiss keyboard when sending OTP
    const rawMobile = mobile.trim();
    const callingCode = country?.callingCode?.[0]; // Get the calling code
    const phoneNumber = `+${callingCode}${rawMobile}`;
    if(rawMobile !== previousMobile){
      setOtpSent(false); // Reset OTP sent status if mobile number has changed
      setTimer(0); // Reset timer when sending OTP for a new number
    }
    // Basic client-side validation
    if (!callingCode || rawMobile.length < 8) { // Assuming min 8 digits for phone numbers globally
      Toast.show({
        type: 'error',
        text1: 'Invalid Mobile Number',
        text2: 'Please enter a valid phone number including country code.',
      });
      return;
    }

    try {
      const success = await sendOTP(phoneNumber);
      if (success) {
        setPreviousMobile(rawMobile); // Store the mobile number for future reference
        setOtpSent(true);
        setTimer(120); // Set timer for 120 seconds (2 minutes)
        Toast.show({
          type: 'success',
          text1: 'OTP sent',
          text2: `Verification code sent to ${phoneNumber}`,
        });
        // Clear OTP input fields for new OTP and focus first one
        setOtp(['', '', '', '', '', '']);
        otpRefs[0].current?.focus();
      }
      // No 'else' needed here, as the hook handles error toasts
    } catch (err) {
      console.error("Error initiating OTP send:", err);
      // The `useFirebaseOTP` hook already displays a toast for errors
    }
  };

  // Handle main login action (OTP verification or password login)
  const handleLogin = async () => {
    Keyboard.dismiss(); // Dismiss keyboard when performing login action

    if (mode === 'otp') {
      const code = otp.join('');
      if (code.length !== 6) {
        Toast.show({
          type: 'error',
          text1: 'Incomplete OTP',
          text2: 'Enter all 6 digits of the OTP.',
        });
        return;
      }

      try {
        const success = await verifyCode(code);
        if (success) {
          setTimer(0); // Reset timer after successful verification
          setOtpSent(false); // Reset OTP sent status after successful verification
          Toast.show({ type: 'success', text1: 'OTP Verified Successfully!' });
          // Clear OTP input fields for new OTP and focus first one AFTER sending
          setOtp(['', '', '', '', '', '']);
          otpRefs[0].current?.focus();
          await login(); // This correctly calls the login action in your Zustand store
        }
        // No 'else' needed here, as the hook handles error toasts
      } catch (err) {
        console.error("Error during OTP verification:", err);
        // The `useFirebaseOTP` hook already displays a toast for errors
      }
    } else if (mode === 'password') {
      // Implement your password login logic here
      console.log('Attempting password login with:', password);
      Toast.show({
        type: 'info',
        text1: 'Password Login',
        text2: 'Password login functionality not implemented in this example.',
      });
      // Example: Call an API for password login
      // if (password === 'mysecurepass') {
      //   Toast.show({ type: 'success', text1: 'Password Login Successful!' });
      //   navigation.navigate('Home');
      // } else {
      //   Toast.show({ type: 'error', text1: 'Password Login Failed', text2: 'Invalid password.' });
      // }
    }
  };

  return (
    <CountryModalProvider>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-white"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: 20 }}
            keyboardShouldPersistTaps="handled" // Important for nested TouchableOpacity/CountryPicker
          >
            <View className="px-6 sm:px-10 md:px-16 bg-white">
              {/* Logo */}
              <Image
                source={require('../../../assets/logo.png')} // Adjust path as per your assets folder
                style={{ width: 100, height: 100, resizeMode: 'contain' }}
                className="mb-6 self-center"
              />
              {/* Welcome Texts */}
              <Text className="text-4xl font-extrabold mb-2 text-center text-airbnb-primary">Hello there 👋</Text>
              <Text className="text-xl font-semibold mb-8 text-center text-airbnb-dark">Welcome to ShipMyPack</Text>

              {/* Country Picker Input */}
              <TouchableOpacity
                className="mb-4 border border-airbnb-secondary rounded-2xl bg-white p-3 flex-row items-center justify-between"
                onPress={() => setPickerVisible(true)}
                disabled={verificationInProgress}
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

                {/* Text for Calling Code (at the end with specific styling) */}
                {country?.callingCode ? (
                  <Text className="text-base ml-2 px-2 py-1 rounded-md text-black">
                    {`+${country.callingCode[0]}`}
                  </Text>
                ) : null}
              </TouchableOpacity>

              {/* Mobile Number Input */}
              <TextInput
                style={{ textAlignVertical: 'center'}}
                className="border border-airbnb-secondary rounded-2xl px-4 py-3 mb-6 text-lg shadow-sm bg-white text-black "
                placeholder="Enter Mobile Number"
                placeholderTextColor={"gray"}
                keyboardType="phone-pad"
                value={mobile}
                onChangeText={setMobile}
                editable={!verificationInProgress} // Disable input during Firebase operations
              />

              {/* Login Mode Selection Buttons */}
              <View className="mb-6">
                <TouchableOpacity
                  onPress={() => {
                    setMode('otp');
                    // Only trigger send OTP if not already sent and timer isn't active
                    if (!otpSent || timer === 0 || previousMobile !== mobile) {
                      handleSendOtp();
                    } else {
                      Toast.show({
                        type: 'info',
                        text1: 'OTP Already Sent',
                        text2: `Please wait ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')} to resend.`,
                      });
                    }
                  }}
                  // Visual feedback for selected mode and loading state
                  className={`h-14 mb-4 justify-center px-5 rounded-full shadow-md ${mode === 'otp' ? 'bg-black' : 'bg-airbnb-secondary'} ${verificationInProgress ? 'opacity-50' : ''}`}
                  disabled={verificationInProgress} // Disable if any Firebase operation is in progress
                >
                  {/* Show activity indicator if in OTP mode and verification is in progress */}
                  {verificationInProgress && mode === 'otp' ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white text-center font-medium">Login with OTP</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setMode('password')}
                  className={`h-14 justify-center px-5 rounded-full shadow-md ${mode === 'password' ? 'bg-black' : 'bg-airbnb-secondary'} ${verificationInProgress ? 'opacity-50' : ''}`}
                  disabled={verificationInProgress} // Disable if any Firebase operation is in progress
                >
                  <Text className="text-white text-center font-medium">Login with Password</Text>
                </TouchableOpacity>
              </View>

              {/* OTP Input Section (Conditionally rendered) */}
              {mode === 'otp' && (
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
                          onFocus={() => {
                            // On focus, set selection to end if there's text
                            if (otp[index] !== '') {
                              otpRefs[index].current?.setNativeProps({ selection: { start: 1, end: 1 } });
                            }
                          }}
                          className="border w-12 h-12 text-center text-xl font-semibold rounded-xl border-airbnb-accent bg-white shadow-sm"
                          editable={!verificationInProgress} // Disable OTP inputs during verification
                        />
                      </View>
                    ))}
                  </View>
                  {/* OTP Resend Timer/Button */}
                  <View className="mb-6">
                    {timer > 0 ? (
                      <Text className="text-center text-airbnb-secondary">
                        Resend OTP in {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                      </Text>
                    ) : (
                      <TouchableOpacity onPress={handleSendOtp} disabled={verificationInProgress}>
                        {verificationInProgress ? (
                          <ActivityIndicator color="#FF385C" />
                        ) : (
                          <Text className="text-airbnb-primary text-center font-medium">Resend Code</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              )}

              {/* Password Input Section (Conditionally rendered) */}
              {mode === 'password' && (
                <>
                  <TextInput
                    placeholder="Enter Password"
                    placeholderTextColor={'gray'}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    style={{ textAlignVertical: 'center' }}
                    className="border border-airbnb-secondary rounded-2xl px-4 py-3 mb-6 text-lg shadow-sm bg-white"
                    editable={!verificationInProgress}
                  />
                  <TouchableOpacity onPress={() => navigation.navigate('Forgot')}>
                    <Text className="text-airbnb-primary text-right mb-6 font-medium">
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Universal Login Button (Visible once a mode is selected) */}
              {mode && (
                <TouchableOpacity
                  onPress={handleLogin}
                  className={`h-14 bg-airbnb-primary justify-center px-5 rounded-full shadow-md mb-6 ${verificationInProgress ? 'opacity-50' : ''}`}
                  disabled={verificationInProgress} // Disable main login button during any Firebase operation
                >
                  {verificationInProgress ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white text-center font-semibold text-lg">Login</Text>
                  )}
                </TouchableOpacity>
              )}

              {/* Sign Up Link */}
              <View className="mt-10 w-full flex-row justify-center">
                <Text className="text-airbnb-secondary">Don’t have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text className="text-airbnb-primary font-semibold">Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </CountryModalProvider>
  );
}