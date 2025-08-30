import 'dotenv/config';
import { Telegraf } from 'telegraf';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

const bot = new Telegraf(process.env.BOT_TOKEN!);

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

bot.start(ctx => ctx.reply('Welcome! Use /products, /addtocart <id>, /checkout'));

bot.command('products', async (ctx) => {
  const snap = await getDocs(collection(db, 'products'));
  const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
  const lines = items.map(i => `${i.id} — ${i.name} (₹${i.price})`).join('\n');
  ctx.reply(lines || 'No products yet.');
});

let cart: any[] = [];

bot.command('addtocart', (ctx) => {
  const id = ctx.message.text.split(' ')[1];
  if (!id) return ctx.reply('Usage: /addtocart <product_id>');
  cart.push({ id, qty: 1 });
  ctx.reply(`Added ${id} to cart.`);
});

bot.command('checkout', async (ctx) => {
  // NOTE: resolve product names/prices in real app
  const ref = await addDoc(collection(db, 'orders'), {
    userId: ctx.from?.id?.toString() || 'telegram',
    items: cart,
    total: 0,
    status: 'received',
    createdAt: serverTimestamp()
  });
  cart = [];
  ctx.reply(`Order placed! ID: ${ref.id}`);
});

bot.command('track', async (ctx) => {
  const id = ctx.message.text.split(' ')[1];
  if (!id) return ctx.reply('Usage: /track <order_id>');
  // In a real implementation, read from Firestore and pretty print status
  ctx.reply(`Your order ${id} is out for delivery.`);
});

bot.launch();
console.log('Bot running');