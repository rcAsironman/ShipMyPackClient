import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './AuthStack';
import AppStack from './AppStack'; // ✅ Use this instead of MainTabs
import { useAuthStore } from '../store/authStore';
import { View, Text } from 'react-native';
import CustomToast from '../components/CustomToast';

export default function RootNavigator() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const hasCheckedAuth = useAuthStore((state) => state.hasCheckedAuth);
  const restoreLogin = useAuthStore((state) => state.restoreLogin);

  useEffect(() => {
    restoreLogin();
  }, []);

  if (!hasCheckedAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? <AppStack /> : <AuthStack />}
      <CustomToast />
    </NavigationContainer>
  );
}
