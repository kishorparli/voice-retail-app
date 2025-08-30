// Quick test script to verify Firebase and Gemini setup
// Run with: node scripts/testSetup.js

const dotenv = require('dotenv');
dotenv.config();

console.log('🔍 Testing Voice Retail App Setup...\n');

// Test 1: Environment Variables
console.log('1. Checking Environment Variables:');
const requiredEnvs = [
  'GEMINI_API_KEY',
  'FIREBASE_API_KEY', 
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID'
];

let envOk = true;
requiredEnvs.forEach(env => {
  const value = process.env[env];
  if (!value || value.includes('paste_your_') || value === '...') {
    console.log(`   ❌ ${env}: Not configured`);
    envOk = false;
  } else {
    console.log(`   ✅ ${env}: Configured`);
  }
});

if (!envOk) {
  console.log('\n❌ Environment setup incomplete. Please update your .env file with real values.');
  console.log('\nNext steps:');
  console.log('1. Get Gemini API key from: https://aistudio.google.com/');
  console.log('2. Get Firebase config from: Firebase Console > Project Settings > Web App');
  process.exit(1);
}

// Test 2: Firebase Connection
console.log('\n2. Testing Firebase Connection:');
async function testFirebase() {
  try {
    const { initializeApp } = require('firebase/app');
    const { getFirestore, connectFirestoreEmulator } = require('firebase/firestore');
    
    const firebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
    };
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('   ✅ Firebase initialized successfully');
    return true;
  } catch (error) {
    console.log('   ❌ Firebase connection failed:', error.message);
    return false;
  }
}

// Test 3: Gemini API
console.log('\n3. Testing Gemini API:');
async function testGemini() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Hello' }]}]
      })
    });
    
    if (response.ok) {
      console.log('   ✅ Gemini API connection successful');
      return true;
    } else {
      console.log('   ❌ Gemini API error:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Gemini API connection failed:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  const firebaseOk = await testFirebase();
  const geminiOk = await testGemini();
  
  console.log('\n📋 Setup Summary:');
  console.log(`   Environment: ✅`);
  console.log(`   Firebase: ${firebaseOk ? '✅' : '❌'}`);
  console.log(`   Gemini API: ${geminiOk ? '✅' : '❌'}`);
  
  if (firebaseOk && geminiOk) {
    console.log('\n🎉 All systems ready! You can now:');
    console.log('   1. Run: npm run seed (to add sample products)');
    console.log('   2. Run: npm start (to start the app)');
  } else {
    console.log('\n⚠️  Some services need attention. Check the errors above.');
  }
}

runTests();