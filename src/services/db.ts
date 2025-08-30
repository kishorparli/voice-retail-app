import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, signInAnonymously } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, collection, addDoc, getDocs, query, where, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID, FIREBASE_STORAGE_BUCKET, FIREBASE_MESSAGING_SENDER_ID, FIREBASE_APP_ID } from '@env';

const firebaseConfig = {
    apiKey: FIREBASE_API_KEY,
    authDomain: FIREBASE_AUTH_DOMAIN,
    projectId: FIREBASE_PROJECT_ID,
    storageBucket: FIREBASE_STORAGE_BUCKET,
    messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
    appId: FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const db = getFirestore(app);

export async function ensureAnon() {
    try {
        if (!auth.currentUser) await signInAnonymously(auth);
        return auth.currentUser?.uid;
    } catch (error) {
        console.error('Firebase auth error:', error);
        throw error;
    }
}

export async function searchProducts(filters: { 
    category?: string; 
    price?: { max?: number; min?: number }; 
    text?: string; 
    limit?: number;
}) {
    try {
        // Simple client-side filter on all products; for scale, model with composite indexes
        const snap = await getDocs(collection(db, 'products'));
        let items = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];

        // Apply filters
        const filteredItems = items.filter(p => {
            let ok = true;
            if (filters.category) ok = ok && (p.category?.toLowerCase() === filters.category.toLowerCase());
            if (filters.price?.max != null) ok = ok && (p.price <= (filters.price!.max!));
            if (filters.price?.min != null) ok = ok && (p.price >= (filters.price!.min!));
            if (filters.text) ok = ok && ((p.name + ' ' + (p.tags || []).join(' ')).toLowerCase().includes(filters.text.toLowerCase()));
            return ok;
        });

        // Apply limit if specified
        if (filters.limit) {
            return filteredItems.slice(0, filters.limit);
        }

        return filteredItems;
    } catch (error) {
        console.error('Error searching products:', error);
        return [];
    }
}

export async function placeOrder({ items, total }: { items: any[]; total: number; }) {
    const uid = await ensureAnon();
    const ref = await addDoc(collection(db, 'orders'), {
        userId: uid,
        items,
        total,
        status: 'received',
        createdAt: serverTimestamp()
    });
    return ref.id;
}

export async function getOrderStatus(orderId: string) {
    const ref = doc(db, 'orders', orderId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data();
}