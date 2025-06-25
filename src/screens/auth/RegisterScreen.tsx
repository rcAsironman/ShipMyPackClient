import React, { useState } from 'react';
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
  Image,
} from 'react-native';
import CountryPicker, {
  Country,
  CountryCode,
  CountryModalProvider,
} from 'react-native-country-picker-modal';

export default function RegisterScreen({ navigation }: any) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [countryCode, setCountryCode] = useState<CountryCode>('IN');
  const [country, setCountry] = useState<Country | null>(null);
  const [registered, setRegistered] = useState(false);

  const onSelect = (country: Country) => {
    setCountryCode(country.cca2);
    setCountry(country);
  };

  const handleRegister = () => {
    console.log('User Registered:', { firstName, lastName, mobile, email });
    setRegistered(true);
  };

  if (registered) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-2xl font-bold text-airbnb-primary">Aadhar KYC Screen</Text>
        <Text className="text-base text-airbnb-dark mt-2">(This is a placeholder screen.)</Text>
      </View>
    );
  }

  return (
    <CountryModalProvider>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-white"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="px-6 sm:px-10 md:px-16 bg-white">
              <Image
                source={require('../../../assets/logo.png')}
                style={{ width: 100, height: 100, resizeMode: 'contain' }}
                className="mb-0 mt-5 self-center"
              />
              <Text className="text-4xl font-extrabold mb-2 text-center text-airbnb-primary">Create Account</Text>
              <Text className="text-xl font-semibold mb-8 text-center text-airbnb-dark">Register on ShipMyPack</Text>

              <TextInput
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
                className="border border-airbnb-secondary rounded-2xl p-4 mb-4 text-lg bg-white text-black"
                placeholderTextColor={'gray'}
              />

              <TextInput
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
                className="border border-airbnb-secondary rounded-2xl p-4 mb-4 text-lg bg-white"
                placeholderTextColor={'gray'}

              />

              <View className="mb-4 border border-airbnb-secondary rounded-2xl bg-white p-3 flex-row items-center justify-between">
                <CountryPicker
                  countryCode={countryCode}
                  withFilter
                  withFlag
                  withCountryNameButton
                  withCallingCode
                  withEmoji
                  onSelect={onSelect}
                />
                <Text className="text-base ml-2">{country?.callingCode ? `+${country.callingCode[0]}` : ''}</Text>
              </View>

              <TextInput
                placeholder="Mobile Number"
                keyboardType="phone-pad"
                value={mobile}
                onChangeText={setMobile}
                className="border border-airbnb-secondary rounded-2xl p-4 mb-4 text-lg bg-white"
                placeholderTextColor={'gray'}

              />

              <TextInput
                placeholder="Email Address"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                className="border border-airbnb-secondary rounded-2xl p-4 mb-4 text-lg bg-white"
                placeholderTextColor={'gray'}

              />

              <TextInput
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                className="border border-airbnb-secondary rounded-2xl p-4 mb-4 text-lg bg-white"
                placeholderTextColor={'gray'}

              />

              <TextInput
                placeholder="Confirm Password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                className="border border-airbnb-secondary rounded-2xl p-4 mb-6 text-lg bg-white"
                placeholderTextColor={'gray'}

              />

              <TouchableOpacity
                onPress={handleRegister}
                className="h-14 bg-airbnb-primary justify-center px-5 rounded-full shadow-md mb-6"
              >
                <Text className="text-white text-center font-semibold text-lg">Register</Text>
              </TouchableOpacity>
            </View>

            <View className="mt-4 w-full flex-row justify-center">
              <Text className="text-airbnb-secondary">Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className="text-airbnb-primary font-semibold">Sign In</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </CountryModalProvider>
  );
}