// Test API connection
import { API_ENDPOINTS } from '../config/api';

export const testAPIConnection = async () => {
  console.log('🔍 Testing API Connection...');
  
  try {
    // Test basic connection
    const response = await fetch(API_ENDPOINTS.CHALLENGES);
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', response.headers);
    
    const contentType = response.headers.get('content-type');
    console.log('📄 Content-Type:', contentType);
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('✅ API is working! Data:', data);
    } else {
      const text = await response.text();
      console.log('❌ API returned HTML instead of JSON:', text.substring(0, 200));
    }
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
};

// Run test only in development
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  testAPIConnection();
} 
