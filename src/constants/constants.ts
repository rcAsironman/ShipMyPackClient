// Server configuration
export const SERVER_URL = 'https://shipmypack.com'; // Change to your local/production IP

// https://shipmypack.com/api-docs/#/User/post_user_login
// Socket endpoints (if needed separately)

export const SOCKET_URL = SERVER_URL;
const PORT = 3000; // Change to your socket server port if different
export const SOCKET_WS_URL = 'ws://shipmypack.com'+':'+PORT; // Change to your socket server port if different
// API Endpoints
export const ENDPOINTS = {
  LOGIN: `${SERVER_URL}/SMP/user/login`,
  REGISTER: `${SERVER_URL}/SMP/user/register`,
  FORGOT_PASSWORD: `${SERVER_URL}/api/auth/forgot-password`,
  RESET_PASSWORD: `${SERVER_URL}/api/auth/reset-password`,
  VERIFY_OTP: `${SERVER_URL}/api/auth/verify-otp`,
  CAROUSEL: `${SERVER_URL}/SMP/carousel/getAll`,
  ORDERS: `${SERVER_URL}/api/orders`,
  NOTIFICATIONS: `${SERVER_URL}/api/notifications`,
  SUPPORT_MESSAGES: `${SERVER_URL}/api/support/messages`,
  PROFILE: `${SERVER_URL}/api/user/profile`,
  EARNINGS: `${SERVER_URL}/api/earnings`,
  UPLOAD_TICKET: `${SERVER_URL}/SMP/s3/upload-image`,
  ADDTRIP: `${SERVER_URL}/SMP/trip/save`,
  ADVERTISEMENT: `${SERVER_URL}/SMP/ads/getAll`,
  FETCH_LOCATIONS: `${SERVER_URL}/SMP/start_points/getAll`,

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
