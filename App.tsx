import 'cross-fetch/polyfill';
import React from 'react';
import RootNav from './src/navigation';
import { CartProvider } from './src/context/CartContext';
import { ensureAnon } from './src/services/db';

export default function App() {
  React.useEffect(() => { ensureAnon(); }, []);
  return (
    <CartProvider>
      <RootNav />
    </CartProvider>
  );
}
