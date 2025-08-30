import { GEMINI_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY, COHERE_API_KEY } from '@env';

// Rate limiting to prevent 429 errors
let lastApiCall = 0;
const MIN_INTERVAL = 2000; // 2 seconds between calls

// AI Provider configuration
type AIProvider = 'openai' | 'anthropic' | 'cohere' | 'gemini' | 'fallback';

const AI_CONFIG = {
  // Try providers in order of preference
  providers: ['openai', 'anthropic', 'cohere', 'gemini', 'fallback'] as AIProvider[],
  
  // API endpoints and configurations
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo',
    key: OPENAI_API_KEY
  },
  anthropic: {
    url: 'https://api.anthropic.com/v1/messages',
    model: 'claude-3-haiku-20240307',
    key: ANTHROPIC_API_KEY
  },
  cohere: {
    url: 'https://api.cohere.ai/v1/generate',
    model: 'command-light',
    key: COHERE_API_KEY
  },
  gemini: {
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
    key: GEMINI_API_KEY
  }
};

export type QueryIntent = {
  category?: string;
  price?: { max?: number; min?: number };
  quantity?: number;
  productName?: string; // for direct add-to-cart
  text?: string;        // for generic contains search
};

const SYSTEM_PROMPT = `You parse retail search or order intents. Return ONLY a compact JSON object with fields among: category, price {min,max}, quantity, productName, text. Examples:
- "Show me breakfast items under 200" -> {"category":"breakfast","price":{"max":200}}
- "Order 2 packs of dosa batter" -> {"productName":"dosa batter","quantity":2}
- "find chutney below 50" -> {"text":"chutney","price":{"max":50}}
Invalid or unknown -> {}`;

// Enhanced fallback parsing with better pattern matching
function fallbackParseIntent(natural: string): QueryIntent {
  const text = natural.toLowerCase();
  const result: QueryIntent = {};
  
  // Extract quantity
  const qtyMatch = text.match(/(\d+)\s*(packs?|pieces?|items?|kg|grams?|liters?)?/);
  if (qtyMatch) result.quantity = parseInt(qtyMatch[1]);
  
  // Extract price constraints
  const priceMatch = text.match(/(under|below|less than|max|maximum)\s*(\d+)/);
  if (priceMatch) result.price = { max: parseInt(priceMatch[2]) };
  
  const minPriceMatch = text.match(/(above|over|more than|min|minimum)\s*(\d+)/);
  if (minPriceMatch) {
    result.price = { ...result.price, min: parseInt(minPriceMatch[1]) };
  }
  
  // Category detection
  const categories = {
    breakfast: ['breakfast', 'morning', 'cereal', 'oats', 'bread', 'milk'],
    spices: ['spice', 'masala', 'powder', 'turmeric', 'chili', 'pepper'],
    condiments: ['sauce', 'chutney', 'pickle', 'jam', 'honey'],
    ready_to_eat: ['ready', 'instant', 'cooked', 'prepared']
  };
  
  for (const [cat, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      result.category = cat;
      break;
    }
  }
  
  // Product name detection (for specific items)
  const productKeywords = ['dosa', 'batter', 'rice', 'dal', 'oil', 'sugar', 'salt'];
  const foundProduct = productKeywords.find(product => text.includes(product));
  if (foundProduct) {
    result.productName = foundProduct;
  }
  
  // Generic text search
  if (!result.category && !result.productName) {
    // Extract meaningful search terms
    const searchTerms = text
      .replace(/\b(show|find|get|order|buy|search|under|below|above|over|less|more|than|me|items?|packs?)\b/g, '')
      .replace(/\d+/g, '')
      .trim();
    
    if (searchTerms) result.text = searchTerms;
  }
  
  return result;
}

// API call functions for different providers
async function callOpenAI(prompt: string): Promise<string> {
  const response = await fetch(AI_CONFIG.openai.url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AI_CONFIG.openai.key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: AI_CONFIG.openai.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      max_tokens: 150,
      temperature: 0.1
    })
  });
  
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '{}';
}

async function callAnthropic(prompt: string): Promise<string> {
  const response = await fetch(AI_CONFIG.anthropic.url, {
    method: 'POST',
    headers: {
      'x-api-key': AI_CONFIG.anthropic.key,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: AI_CONFIG.anthropic.model,
      max_tokens: 150,
      messages: [{ role: 'user', content: `${SYSTEM_PROMPT}\n\nUser: ${prompt}` }]
    })
  });
  
  const data = await response.json();
  return data.content?.[0]?.text || '{}';
}

async function callCohere(prompt: string): Promise<string> {
  const response = await fetch(AI_CONFIG.cohere.url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AI_CONFIG.cohere.key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: AI_CONFIG.cohere.model,
      prompt: `${SYSTEM_PROMPT}\n\nUser: ${prompt}\nResponse:`,
      max_tokens: 150,
      temperature: 0.1,
      stop_sequences: ['\n']
    })
  });
  
  const data = await response.json();
  return data.generations?.[0]?.text || '{}';
}

async function callGemini(prompt: string): Promise<string> {
  const body = {
    contents: [{ role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\nUser: ${prompt}` }]}],
    generationConfig: { responseMimeType: 'application/json' }
  };
  
  const response = await fetch(`${AI_CONFIG.gemini.url}?key=${AI_CONFIG.gemini.key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
}

export async function parseIntent(natural: string): Promise<QueryIntent> {
  console.log('🤖 parseIntent called with:', natural);
  
  // Rate limiting
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCall;
  if (timeSinceLastCall < MIN_INTERVAL) {
    console.log('⏱️ Rate limiting: using fallback parsing');
    return fallbackParseIntent(natural);
  }
  lastApiCall = now;

  // Try each provider in order
  for (const provider of AI_CONFIG.providers) {
    try {
      let result: string = '{}';
      
      switch (provider) {
        case 'openai':
          if (!AI_CONFIG.openai.key || AI_CONFIG.openai.key === 'paste_your_openai_key_here') continue;
          console.log('🤖 Using OpenAI for intent parsing');
          result = await callOpenAI(natural);
          break;
          
        case 'anthropic':
          if (!AI_CONFIG.anthropic.key || AI_CONFIG.anthropic.key === 'paste_your_anthropic_key_here') continue;
          console.log('🧠 Using Anthropic Claude for intent parsing');
          result = await callAnthropic(natural);
          break;
          
        case 'cohere':
          if (!AI_CONFIG.cohere.key || AI_CONFIG.cohere.key === 'paste_your_cohere_key_here') continue;
          console.log('🔮 Using Cohere for intent parsing');
          result = await callCohere(natural);
          break;
          
        case 'gemini':
          if (!AI_CONFIG.gemini.key || AI_CONFIG.gemini.key === 'paste_your_gemini_key_here') continue;
          console.log('✨ Using Gemini for intent parsing');
          result = await callGemini(natural);
          break;
          
        case 'fallback':
          console.log('🔧 Using enhanced fallback parsing');
          return fallbackParseIntent(natural);
      }
      
      // Parse and validate result
      const parsed = JSON.parse(result);
      if (parsed && typeof parsed === 'object') {
        console.log(`✅ Successfully parsed with ${provider}:`, parsed);
        return parsed;
      }
    } catch (error) {
      console.log(`❌ ${provider} failed:`, error.message);
      continue; // Try next provider
    }
  }
  
  // If all providers fail, use fallback
  console.log('🔧 All AI providers failed, using enhanced fallback');
  return fallbackParseIntent(natural);
}

export async function categorizeProduct(name: string): Promise<string> {
  // Enhanced fallback categorization
  const fallbackCategorize = (productName: string): string => {
    const name = productName.toLowerCase();
    
    if (name.includes('breakfast') || name.includes('cereal') || name.includes('oats') || 
        name.includes('bread') || name.includes('milk') || name.includes('dosa')) {
      return 'breakfast';
    }
    
    if (name.includes('spice') || name.includes('masala') || name.includes('powder') ||
        name.includes('turmeric') || name.includes('chili') || name.includes('pepper')) {
      return 'spices';
    }
    
    if (name.includes('sauce') || name.includes('chutney') || name.includes('pickle') ||
        name.includes('jam') || name.includes('honey') || name.includes('ketchup')) {
      return 'condiments';
    }
    
    if (name.includes('ready') || name.includes('instant') || name.includes('cooked') ||
        name.includes('prepared') || name.includes('mix')) {
      return 'ready_to_eat';
    }
    
    return 'other';
  };

  // Try AI providers for categorization
  for (const provider of AI_CONFIG.providers) {
    try {
      const prompt = `Categorize product name into one of [ready_to_eat, spices, condiments, breakfast]. Return ONLY the category string.\nName: ${name}`;
      let result = '';
      
      switch (provider) {
        case 'openai':
          if (!AI_CONFIG.openai.key || AI_CONFIG.openai.key === 'paste_your_openai_key_here') continue;
          result = await callOpenAI(prompt);
          break;
          
        case 'anthropic':
          if (!AI_CONFIG.anthropic.key || AI_CONFIG.anthropic.key === 'paste_your_anthropic_key_here') continue;
          result = await callAnthropic(prompt);
          break;
          
        case 'cohere':
          if (!AI_CONFIG.cohere.key || AI_CONFIG.cohere.key === 'paste_your_cohere_key_here') continue;
          result = await callCohere(prompt);
          break;
          
        case 'gemini':
          if (!AI_CONFIG.gemini.key || AI_CONFIG.gemini.key === 'paste_your_gemini_key_here') continue;
          result = await callGemini(prompt);
          break;
          
        case 'fallback':
          return fallbackCategorize(name);
      }
      
      const category = result.trim().toLowerCase();
      if (['ready_to_eat', 'spices', 'condiments', 'breakfast'].includes(category)) {
        return category;
      }
    } catch (error) {
      console.log(`Categorization failed with ${provider}:`, error.message);
      continue;
    }
  }
  
  // Use fallback if all AI providers fail
  return fallbackCategorize(name);
}