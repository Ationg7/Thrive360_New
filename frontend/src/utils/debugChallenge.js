// Debug script for challenge creation
import { challengesAPI } from '../services/api';
import { API_ENDPOINTS } from '../config/api';

export const debugChallengeCreation = async () => {
  console.log('🔍 Debugging Challenge Creation...');
  
  // Check if user is logged in
  const token = localStorage.getItem('authToken');
  console.log('🔑 Auth Token:', token ? 'Present' : 'Missing');
  
  // Check if backend is reachable (uses configured API endpoint)
  try {
    const response = await fetch(API_ENDPOINTS.CHALLENGES);
    console.log('🌐 Backend reachable:', response.ok);
    console.log('📊 Response status:', response.status);
  } catch (error) {
    console.error('❌ Backend not reachable:', error.message);
  }
  
  // Test challenge creation with sample data
  const sampleChallenge = {
    title: 'Test Challenge',
    description: 'This is a test challenge',
    type: 'Daily',
    days_left: 7,
    theme: 'blue'
  };
  
  try {
    console.log('🧪 Testing challenge creation...');
    const result = await challengesAPI.createChallenge(sampleChallenge);
    console.log('✅ Challenge created successfully:', result);
  } catch (error) {
    console.error('❌ Challenge creation failed:', error.message);
    console.error('📋 Full error:', error);
  }
};

// Run debug when imported only in development
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  debugChallengeCreation();
} 
