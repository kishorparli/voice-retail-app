Retail App

A complete React Native (Expo) app with search, AI-powered NLU, Firebase backend, and optional Telegram bot integration.

## Features

- 🤖 **Multi-Provider AI** - OpenAI, Anthropic, Cohere, Gemini with smart fallback
- 🛒 Shopping cart with checkout
- 📦 Order tracking with premium glassmorphism UI
- 🔥 Firebase Firestore backend
- 📱 Cross-platform (iOS/Android/Web)
- 🤖 Optional Telegram bot
- ✨ **Premium UI** - Glassmorphism design with enhanced UX

## Prerequisites

- Node.js 18+ (or 20 LTS)
- Expo CLI: `npm i -g expo`
- Firebase project with Firestore + Authentication (Anonymous enabled)
- Google AI Studio (Gemini) API key: https://aistudio.google.com/
- (Optional) Telegram Bot token via @BotFather

## Quick Setup (5 Minutes)

### 1. Configure Environment Variables

Update `.env` with your actual credentials (see detailed steps below):

```env
GEMINI_API_KEY=your_actual_gemini_key
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Seed Database (Automated)

```bash
npm run seed
```

### 4. Start Development

```bash
npm start
```

### Permissions Required

The app automatically requests microphone permissions:

- **iOS**: `NSMicrophoneUsageDescription` in app.json
- **Android**: `RECORD_AUDIO` permission in app.json



- **Real-time Recognition**: Live speech-to-text conversion
- **Smart Error Handling**: Graceful fallback for network/permission issues
- **Auto-submit**: Automatically searches after voice input
- **Visual Feedback**: Animated listening states and status indicators
- **Fallback Mode**: Sample commands when voice unavailable (Expo Go)

## 🤖 AI Provider Configuration

The app supports multiple AI providers with automatic fallback:

### Supported Providers

1. **OpenAI GPT** (Recommended)
   ```env
   OPENAI_API_KEY=sk-your_openai_key_here
   ```

2. **Anthropic Claude**
   ```env
   ANTHROPIC_API_KEY=sk-ant-your_anthropic_key_here
   ```

3. **Cohere**
   ```env
   COHERE_API_KEY=your_cohere_key_here
   ```

4. **Google Gemini**
   ```env
   GEMINI_API_KEY=your_gemini_key_here
   ```

### Fallback System

The app tries providers in this order:
1. OpenAI → 2. Anthropic → 3. Cohere → 4. Gemini → 5. Enhanced Local Parsing

Just add any API key and the system automatically uses the best available provider!

This automatically adds sample products to your Firestore database.

### 4. Run the App

```bash
npm start
```

Use Expo Go app to scan QR code, or run on simulator.



## Telegram Bot (Optional)

1. Navigate to `server/telegram-bot/`
2. Install dependencies: `npm install`
3. Set environment variables
4. Run: `BOT_TOKEN=your_token node index.ts`

## Project Structure

```
voice-retail-app/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # App screens
│   ├── navigation/     # Navigation setup
│   ├── context/        # React context (Cart)
│   ├── services/       # Firebase, AI, rules
│   ├── utils/          # Helper functions
│   └── data/           # Seed data
└── server/
    └── telegram-bot/   # Optional Telegram integration
```

## Troubleshooting

- **ReadableStream error**: The `cross-fetch/polyfill` import in App.tsx should fix this
- **Voice permissions**: Check app.json has microphone permissions configured
- **Network issues**: Use `npx expo start --tunnel` if QR scan fails
- **Firebase errors**: Verify your .env credentials and Firestore rules

## Production Notes

- Move Gemini API calls to a secure backend
- Add proper Firestore security rules
- Implement proper error handling and loading states
- Add product images and better UI styling
- Scale search with Firestore indexes or Cloud Functions

Enjoy building! 🚀
