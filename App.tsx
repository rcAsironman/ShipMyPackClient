import 'react-native-gesture-handler'; // ✅ must be first
import { enableScreens } from 'react-native-screens';
enableScreens();                        // ✅ improves navigation performance
import './src/config/firebaseConfig'
import React from 'react';
import RootNavigator from './src/navigation/RootNavigator';
import './global.css';                 // ✅ for NativeWind v4

export default function App() {
  return <RootNavigator />;
}