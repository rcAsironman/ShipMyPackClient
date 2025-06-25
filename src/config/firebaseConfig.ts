// src/config/firebaseConfig.ts

import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';

// ✅ You only need to configure if firebase app is not initialized externally
const firebaseConfig = {
  apiKey: 'AIzaSyAWPnGLakR-FIoynbGt3EiKFRf6ZKMNTOM',
  authDomain: 'shipmypack.firebaseapp.com',
  projectId: 'shipmypack',
  storageBucket: 'shipmypack.appspot.com',
  messagingSenderId: '250615517583',
  appId: '1:250615517583:ios:3a1eefb61d262f38304622',
};

// ✅ Optional: initialize only if no app is present (usually not needed with @react-native-firebase)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// ✅ Get the default app and auth instance
const firebaseApp = firebase.app();
const firebaseAuth = auth();

export { firebaseApp, firebaseAuth };