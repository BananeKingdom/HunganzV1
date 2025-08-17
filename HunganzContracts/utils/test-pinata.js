#!/usr/bin/env node

/**
 * Simple Pinata Authentication Test
 * Tests if your current Pinata credentials work
 */

const axios = require('axios');
require('dotenv').config();

const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_API_KEY;

async function testPinataAuth() {
  console.log('🧪 Testing Pinata Authentication...\n');

  // Setup headers based on available credentials
  const headers = {};
  let authMethod = '';

  if (PINATA_JWT) {
    headers['Authorization'] = `Bearer ${PINATA_JWT}`;
    authMethod = 'JWT Token';
  } else if (PINATA_API_KEY && PINATA_SECRET_KEY) {
    headers['pinata_api_key'] = PINATA_API_KEY;
    headers['pinata_secret_api_key'] = PINATA_SECRET_KEY;
    authMethod = 'API Key + Secret';
  } else if (PINATA_API_KEY) {
    headers['pinata_api_key'] = PINATA_API_KEY;
    authMethod = 'API Key Only';
  } else {
    console.error('❌ No Pinata credentials found in .env file');
    return;
  }

  console.log(`🔑 Testing with: ${authMethod}`);
  console.log(`📋 API Key: ${PINATA_API_KEY ? PINATA_API_KEY.substring(0, 8) + '...' : 'Not set'}`);
  console.log(`🔐 Secret: ${PINATA_SECRET_KEY ? 'Set' : 'Not set'}`);
  console.log(`🎫 JWT: ${PINATA_JWT ? 'Set' : 'Not set'}\n`);

  try {
    // Test 1: Check authentication with testAuthentication endpoint
    console.log('📡 Testing authentication...');
    const authResponse = await axios.get('https://api.pinata.cloud/data/testAuthentication', {
      headers
    });

    if (authResponse.status === 200) {
      console.log('✅ Authentication successful!');
      console.log(`📊 Response: ${authResponse.data.message || 'OK'}\n`);
    }

    // Test 2: Get account info
    console.log('📊 Getting account information...');
    const userResponse = await axios.get('https://api.pinata.cloud/data/userPinnedDataTotal', {
      headers
    });

    if (userResponse.status === 200) {
      console.log('✅ Account info retrieved successfully!');
      console.log(`📁 Total pins: ${userResponse.data.pin_count || 'Unknown'}`);
      console.log(`💾 Total size: ${userResponse.data.pin_size_total || 'Unknown'} bytes\n`);
    }

    console.log('🎉 All tests passed! Your Pinata credentials are working correctly.');
    console.log('✅ You can now use the IPFS uploader utility.');

  } catch (error) {
    console.error('❌ Authentication failed!');
    console.error(`📋 Status: ${error.response?.status || 'Unknown'}`);
    console.error(`💬 Message: ${error.response?.data?.error || error.message}`);
    
    if (error.response?.status === 401) {
      console.log('\n🔧 Troubleshooting suggestions:');
      console.log('1. Check if your API key is correct');
      console.log('2. If using API key only, try getting the secret key from Pinata dashboard');
      console.log('3. Consider creating a new JWT token (recommended method)');
      console.log('4. Visit https://app.pinata.cloud/developers/api-keys');
    }
  }
}

// Run the test
testPinataAuth();
