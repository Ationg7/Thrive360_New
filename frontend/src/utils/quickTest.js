// Quick connection test
import { API_ENDPOINTS } from '../config/api';

export const quickTest = async () => {
  console.log('🧪 Quick API Test...');
  
  try {
    const response = await fetch(API_ENDPOINTS.CHALLENGES);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend is running! Found', data.length, 'challenges');
    } else {
      console.log('❌ Backend responded with status:', response.status);
    }
  } catch (error) {
    console.log('❌ Cannot connect to backend:', error.message);
    console.log('💡 Make sure the API endpoint is reachable');
  }
};

// Auto-run test only in development
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  quickTest();
} 
