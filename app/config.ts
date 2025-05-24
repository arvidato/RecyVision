import Constants from 'expo-constants';

// Get the local IP address from the development server
const getLocalIP = () => {
  if (__DEV__) {
    // In development, use the local IP from the development server
    const localIP = Constants.expoConfig?.extra?.localIP || '192.168.37.17';
    return `http://${localIP}:5001`;
  }
  // In production, use the production API URL
  return 'https://api.recyvision.com'; // Replace with your production API URL
};

export const config = {
  API_URL: getLocalIP(),
  API_ENDPOINTS: {
    PREDICT: '/predict',
    PREDICT_GEMINI: '/predict-gemini',
  },
};

export default config; 