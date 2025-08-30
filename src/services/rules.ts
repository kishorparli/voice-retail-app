export function personalizedOffers(history: any[]) {
  // Very simple rules: if user bought south indian breakfast 2+ times
  const south = history.filter(h => (h.tags||[]).includes('south_indian')).length;
  const offers: string[] = [];
  if (south >= 2) offers.push('Since you love South Indian breakfast, enjoy 10% off on Chutneys!');
  return offers;
}

const CROSS_SELL: Record<string,string[]> = {
  "Dosa Batter": ["Coconut Chutney"],
  "Idly Batter": ["Coconut Chutney"],
  "Rasam Powder": ["Papad"],
};

export function recommend(forName: string): string[] {
  return CROSS_SELL[forName] || [];
}