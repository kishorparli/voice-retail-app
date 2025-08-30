// Script to automatically seed Firestore with sample products
// Run with: node scripts/seedFirestore.js

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Comprehensive products database for voice search testing
const sampleProducts = [
  // BREAKFAST ITEMS (15 products)
  { id: "b1", name: "Idly Batter", category: "breakfast", price: 80, tags: ["breakfast","south_indian","batter"] },
  { id: "b2", name: "Dosa Batter", category: "breakfast", price: 95, tags: ["breakfast","south_indian","batter"] },
  { id: "b3", name: "Cornflakes", category: "breakfast", price: 180, tags: ["breakfast","cereal"] },
  { id: "b4", name: "Oats", category: "breakfast", price: 120, tags: ["breakfast","healthy","cereal"] },
  { id: "b5", name: "Bread Loaf", category: "breakfast", price: 45, tags: ["breakfast","bread"] },
  { id: "b6", name: "Butter", category: "breakfast", price: 85, tags: ["breakfast","dairy"] },
  { id: "b7", name: "Jam Strawberry", category: "breakfast", price: 65, tags: ["breakfast","sweet","jam"] },
  { id: "b8", name: "Honey", category: "breakfast", price: 150, tags: ["breakfast","sweet","natural"] },
  { id: "b9", name: "Milk 1L", category: "breakfast", price: 55, tags: ["breakfast","dairy","milk"] },
  { id: "b10", name: "Eggs 12pcs", category: "breakfast", price: 75, tags: ["breakfast","protein","eggs"] },
  { id: "b11", name: "Pancake Mix", category: "breakfast", price: 95, tags: ["breakfast","mix","pancake"] },
  { id: "b12", name: "Muesli", category: "breakfast", price: 220, tags: ["breakfast","healthy","cereal"] },
  { id: "b13", name: "Yogurt", category: "breakfast", price: 40, tags: ["breakfast","dairy","healthy"] },
  { id: "b14", name: "Granola", category: "breakfast", price: 180, tags: ["breakfast","healthy","nuts"] },
  { id: "b15", name: "Poha", category: "breakfast", price: 35, tags: ["breakfast","indian","flakes"] },

  // SPICES (20 products)
  { id: "s1", name: "Turmeric Powder", category: "spices", price: 45, tags: ["spices","powder","turmeric"] },
  { id: "s2", name: "Red Chili Powder", category: "spices", price: 65, tags: ["spices","powder","chili","hot"] },
  { id: "s3", name: "Coriander Powder", category: "spices", price: 55, tags: ["spices","powder","coriander"] },
  { id: "s4", name: "Cumin Powder", category: "spices", price: 85, tags: ["spices","powder","cumin"] },
  { id: "s5", name: "Garam Masala", category: "spices", price: 95, tags: ["spices","masala","blend"] },
  { id: "s6", name: "Rasam Powder", category: "spices", price: 120, tags: ["spices","rasam","south_indian"] },
  { id: "s7", name: "Sambar Powder", category: "spices", price: 110, tags: ["spices","sambar","south_indian"] },
  { id: "s8", name: "Black Pepper", category: "spices", price: 180, tags: ["spices","pepper","whole"] },
  { id: "s9", name: "Cardamom", category: "spices", price: 250, tags: ["spices","cardamom","whole"] },
  { id: "s10", name: "Cinnamon Sticks", category: "spices", price: 120, tags: ["spices","cinnamon","whole"] },
  { id: "s11", name: "Cloves", category: "spices", price: 200, tags: ["spices","cloves","whole"] },
  { id: "s12", name: "Bay Leaves", category: "spices", price: 35, tags: ["spices","bay_leaves","whole"] },
  { id: "s13", name: "Mustard Seeds", category: "spices", price: 45, tags: ["spices","mustard","seeds"] },
  { id: "s14", name: "Fenugreek Seeds", category: "spices", price: 55, tags: ["spices","fenugreek","seeds"] },
  { id: "s15", name: "Fennel Seeds", category: "spices", price: 75, tags: ["spices","fennel","seeds"] },
  { id: "s16", name: "Asafoetida", category: "spices", price: 85, tags: ["spices","asafoetida","hing"] },
  { id: "s17", name: "Curry Leaves", category: "spices", price: 25, tags: ["spices","curry_leaves","fresh"] },
  { id: "s18", name: "Ginger Garlic Paste", category: "spices", price: 65, tags: ["spices","paste","ginger","garlic"] },
  { id: "s19", name: "Tandoori Masala", category: "spices", price: 75, tags: ["spices","tandoori","masala"] },
  { id: "s20", name: "Biryani Masala", category: "spices", price: 95, tags: ["spices","biryani","masala"] },

  // CONDIMENTS & SAUCES (15 products)
  { id: "c1", name: "Coconut Chutney", category: "condiments", price: 45, tags: ["condiments","chutney","coconut"] },
  { id: "c2", name: "Mint Chutney", category: "condiments", price: 40, tags: ["condiments","chutney","mint"] },
  { id: "c3", name: "Tamarind Chutney", category: "condiments", price: 50, tags: ["condiments","chutney","tamarind"] },
  { id: "c4", name: "Tomato Ketchup", category: "condiments", price: 55, tags: ["condiments","ketchup","tomato"] },
  { id: "c5", name: "Soy Sauce", category: "condiments", price: 65, tags: ["condiments","sauce","soy"] },
  { id: "c6", name: "Vinegar", category: "condiments", price: 35, tags: ["condiments","vinegar","cooking"] },
  { id: "c7", name: "Olive Oil", category: "condiments", price: 280, tags: ["condiments","oil","olive","healthy"] },
  { id: "c8", name: "Coconut Oil", category: "condiments", price: 150, tags: ["condiments","oil","coconut"] },
  { id: "c9", name: "Mustard Oil", category: "condiments", price: 120, tags: ["condiments","oil","mustard"] },
  { id: "c10", name: "Sesame Oil", category: "condiments", price: 180, tags: ["condiments","oil","sesame"] },
  { id: "c11", name: "Pickle Mixed", category: "condiments", price: 85, tags: ["condiments","pickle","mixed"] },
  { id: "c12", name: "Mango Pickle", category: "condiments", price: 75, tags: ["condiments","pickle","mango"] },
  { id: "c13", name: "Lemon Pickle", category: "condiments", price: 65, tags: ["condiments","pickle","lemon"] },
  { id: "c14", name: "Mayonnaise", category: "condiments", price: 95, tags: ["condiments","mayo","sauce"] },
  { id: "c15", name: "Hot Sauce", category: "condiments", price: 85, tags: ["condiments","sauce","hot","spicy"] },

  // READY TO EAT (12 products)
  { id: "r1", name: "Instant Noodles", category: "ready_to_eat", price: 25, tags: ["ready_to_eat","noodles","instant"] },
  { id: "r2", name: "Pasta", category: "ready_to_eat", price: 85, tags: ["ready_to_eat","pasta","italian"] },
  { id: "r3", name: "Rice Instant", category: "ready_to_eat", price: 45, tags: ["ready_to_eat","rice","instant"] },
  { id: "r4", name: "Soup Mix", category: "ready_to_eat", price: 35, tags: ["ready_to_eat","soup","mix"] },
  { id: "r5", name: "Upma Mix", category: "ready_to_eat", price: 55, tags: ["ready_to_eat","upma","south_indian"] },
  { id: "r6", name: "Poha Mix", category: "ready_to_eat", price: 45, tags: ["ready_to_eat","poha","indian"] },
  { id: "r7", name: "Khichdi Mix", category: "ready_to_eat", price: 65, tags: ["ready_to_eat","khichdi","healthy"] },
  { id: "r8", name: "Biryani Mix", category: "ready_to_eat", price: 95, tags: ["ready_to_eat","biryani","rice"] },
  { id: "r9", name: "Pulao Mix", category: "ready_to_eat", price: 75, tags: ["ready_to_eat","pulao","rice"] },
  { id: "r10", name: "Canned Beans", category: "ready_to_eat", price: 55, tags: ["ready_to_eat","beans","canned"] },
  { id: "r11", name: "Frozen Paratha", category: "ready_to_eat", price: 85, tags: ["ready_to_eat","paratha","frozen"] },
  { id: "r12", name: "Sandwich Bread", category: "ready_to_eat", price: 40, tags: ["ready_to_eat","bread","sandwich"] }
];

async function seedProducts() {
  try {
    console.log('🌱 Starting to seed Firestore with sample products...');
    
    // Check if Firebase config is loaded
    if (!process.env.FIREBASE_PROJECT_ID) {
      console.error('❌ Firebase configuration not found in .env file');
      console.log('Make sure your .env file has all Firebase credentials');
      return;
    }
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log(`📦 Adding ${sampleProducts.length} products to Firestore...`);
    
    // Add each product to Firestore
    for (const product of sampleProducts) {
      const { id, ...productData } = product;
      await setDoc(doc(db, 'products', id), productData);
      console.log(`✅ Added: ${productData.name} (${id})`);
    }
    
    console.log('🎉 Successfully seeded all products!');
    console.log('🚀 Your app is ready to use!');
    console.log('\nNext steps:');
    console.log('1. Run: npm start');
    console.log('2. Test voice search: "Show me breakfast items under 200"');
    
  } catch (error) {
    console.error('❌ Error seeding products:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure your .env file has correct Firebase credentials');
    console.log('2. Ensure Firestore is enabled in your Firebase project');
    console.log('3. Check that Firestore rules allow writes (test mode)');
    console.log('4. Verify your internet connection');
  }
}

seedProducts();