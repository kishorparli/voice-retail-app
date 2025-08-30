import React, { createContext, useContext, useMemo, useState } from 'react';

type CartItem = { id: string; name: string; price: number; qty: number };

type CartCtx = {
  items: CartItem[];
  add: (p: { id: string; name: string; price: number }, qty?: number) => void;
  remove: (id: string) => void;
  total: number;
  clear: () => void;
};

const Ctx = createContext<CartCtx>(null as any);
export const useCart = () => useContext(Ctx);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const add = (p: { id: string; name: string; price: number }, qty: number = 1) => {
    setItems(prev => {
      const i = prev.find(x => x.id === p.id);
      if (i) return prev.map(x => x.id === p.id ? { ...x, qty: x.qty + qty } : x);
      return [...prev, { ...p, qty }];
    });
  };
  const remove = (id: string) => setItems(prev => prev.filter(x => x.id !== id));
  const clear = () => setItems([]);
  const total = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);
  return <Ctx.Provider value={{ items, add, remove, total, clear }}>{children}</Ctx.Provider>;
};