export function simpleParse(q: string) {
  const s = q.toLowerCase();
  const out: any = {};
  const qty = s.match(/\b(\d+)\s*(pack|packs|x)?\b/);
  if (qty) out.quantity = Number(qty[1]);
  const under = s.match(/under\s*(\d+)/) || s.match(/below\s*(\d+)/);
  if (under) out.price = { ...(out.price||{}), max: Number(under[1]) };
  const over = s.match(/over\s*(\d+)/) || s.match(/above\s*(\d+)/);
  if (over) out.price = { ...(out.price||{}), min: Number(over[1]) };
  const cats = ['breakfast','spices','condiments','ready_to_eat'];
  for (const c of cats) if (s.includes(c)) out.category = c;
  // crude product name guess
  const m = s.match(/order\s+(.*)/) || s.match(/add\s+(.*)/);
  if (m) out.productName = m[1].replace(/\d+.*/, '').trim();
  return out;
}