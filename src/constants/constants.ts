// Server configuration
export const SERVER_URL = 'http://192.168.0.14:3000'; // Change to your local/production IP

// Socket endpoints (if needed separately)
export const SOCKET_URL = SERVER_URL;

// API Endpoints
export const ENDPOINTS = {
  LOGIN: `${SERVER_URL}/api/auth/login`,
  REGISTER: `${SERVER_URL}/api/auth/register`,
  FORGOT_PASSWORD: `${SERVER_URL}/api/auth/forgot-password`,
  RESET_PASSWORD: `${SERVER_URL}/api/auth/reset-password`,
  VERIFY_OTP: `${SERVER_URL}/api/auth/verify-otp`,
  CAROUSEL: `${SERVER_URL}/SMP/carousel/getAll`,
  ORDERS: `${SERVER_URL}/api/orders`,
  NOTIFICATIONS: `${SERVER_URL}/api/notifications`,
  SUPPORT_MESSAGES: `${SERVER_URL}/api/support/messages`,
  PROFILE: `${SERVER_URL}/api/user/profile`,
  EARNINGS: `${SERVER_URL}/api/earnings`,
  ADDTRIP: `${SERVER_URL}/SMP/transporter/save`,
  ADVERTISEMENT: `${SERVER_URL}/SMP/ads/getAll`,
  // Add others as needed
};

// App-wide constants
export const COLORS = {
  PRIMARY: '#DA2824',
  SECONDARY: '#FFFFFF',
  TEXT: '#000000',
  SUCCESS: '#22c55e',
  ERROR: '#ef4444',
  WARNING: '#facc15',
  GREY: '#9ca3af',
  BACKGROUND: '#f9fafb',
};

export const APP_NAME = 'ShipMyPack';

export const SOCKET_EVENTS = {
  CAROUSEL_CREATE: 'carouselCreate',
  CAROUSEL_UPDATE: 'carouselUpdate',
  ORDER_UPDATE: 'orderUpdate',
  // Add others as needed
};

export const DATE_FORMATS = {
  DISPLAY_DATE: 'DD MMM YYYY',
  DISPLAY_TIME: 'hh:mm A',
  FULL_DATE_TIME: 'DD MMM YYYY, hh:mm A',
};
