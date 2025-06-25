// src/hooks/useFirebaseOTP.ts
import { useState, useRef } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message'; // Correct import for Toast

export function useFirebaseOTP() {
  const [error, setError] = useState<string | null>(null);
  const [verificationInProgress, setVerificationInProgress] = useState(false);

  // useRef to store the confirmation result, which is crucial for the second step of OTP verification
  const confirmationResultRef = useRef<FirebaseAuthTypes.ConfirmationResult | null>(null);

  /**
   * Sends an OTP SMS to the provided phone number.
   * @param phoneNumber The phone number to send the OTP to (e.g., "+919876543210").
   * @returns {Promise<boolean>} True if OTP was sent successfully, false otherwise.
   */
  const sendOTP = async (phoneNumber: string): Promise<boolean> => {
    setError(null);
    setVerificationInProgress(true);
    try {
      // signInWithPhoneNumber initiates the phone number verification process
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      confirmationResultRef.current = confirmation; // Store the confirmation result
      setVerificationInProgress(false);
      console.log('OTP sent successfully for:', phoneNumber, 'Confirmation result:', confirmation);
      return true;
    } catch (e: any) {
      setVerificationInProgress(false);
      let errorMessage = 'Could not send OTP. Please try again.';

      // More specific error handling based on Firebase error codes
      if (e.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (e.code === 'auth/invalid-phone-number') {
        errorMessage = 'The phone number format is invalid.';
      } else if (e.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (e.code === 'auth/quota-exceeded') {
        errorMessage = 'SMS quota exceeded. Please try again later.';
      } else if (e.code === 'auth/missing-phone-number') {
        errorMessage = 'Phone number is required.';
      }

      setError(errorMessage);
      console.error('Firebase OTP Error (sendOTP):', e);
      Toast.show({
        type: 'error',
        text1: 'OTP Sending Failed',
        text2: errorMessage,
      });
      return false; // Indicate failure
    }
  };

  /**
   * Verifies the provided OTP code.
   * @param code The 6-digit OTP received by the user.
   * @returns {Promise<boolean>} True if verification was successful, false otherwise.
   */
  const verifyCode = async (code: string): Promise<boolean> => {
    setError(null);
    setVerificationInProgress(true);

    if (!confirmationResultRef.current) {
      const msg = 'No verification session found. Please resend OTP.';
      setError(msg);
      setVerificationInProgress(false);
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: msg,
      });
      return false; // Indicate failure
    }

    try {
      // Confirm the code received by the user against the stored confirmation result
      await confirmationResultRef.current.confirm(code);
      setVerificationInProgress(false);
      console.log('OTP Verified successfully!');
      return true; // Indicate success
    } catch (e: any) {
      setVerificationInProgress(false);
      let errorMessage = 'Invalid OTP. Please try again.';

      // More specific error handling for verification errors
      if (e.code === 'auth/invalid-verification-code') {
        errorMessage = 'The verification code is invalid.';
      } else if (e.code === 'auth/code-expired') {
        errorMessage = 'The verification code has expired. Please resend.';
      } else if (e.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (e.code === 'auth/network-request-failed') {
        errorMessage = 'Network error during verification. Please check your internet connection.';
      }

      setError(errorMessage);
      console.error('Firebase Code Verification Error (verifyCode):', e);
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: errorMessage,
      });
      return false; // Indicate failure
    }
  };

  return { sendOTP, verifyCode, error, verificationInProgress };
}