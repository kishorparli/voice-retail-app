import { Platform } from 'react-native';

// Conditional import for voice - only load if available
let Voice: any = null;
try {
  Voice = require('@react-native-voice/voice').default;
} catch (error) {
  console.log('Voice module not available - running in Expo Go');
}

export interface VoiceConfig {
  language: string;
  timeout?: number;
  partialResults?: boolean;
}

export class VoiceService {
  private static instance: VoiceService;
  private isInitialized = false;
  private isListening = false;

  static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Check if Voice module is available (not in Expo Go)
      if (!Voice) {
        console.log('Voice module not available - running in Expo Go');
        return false;
      }

      // Check if voice is available on device
      const available = await Voice.isAvailable();
      if (!available) {
        console.log('Voice recognition not available on this device');
        return false;
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.log('Failed to initialize voice service:', error);
      return false;
    }
  }

  async startListening(config: VoiceConfig = { language: 'en-US' }): Promise<void> {
    if (!Voice) {
      throw new Error('Voice service not available in Expo Go');
    }

    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('Voice service not available');
      }
    }

    if (this.isListening) {
      await this.stopListening();
    }

    try {
      this.isListening = true;
      
      // Configure voice recognition options
      const options = {
        language: config.language,
        timeout: config.timeout || 10000, // 10 seconds
        partialResults: config.partialResults || false,
        continuous: false,
        interimResults: false,
      };

      await Voice.start(config.language, options);
      console.log(`🎤 Started listening in ${config.language}`);
    } catch (error) {
      this.isListening = false;
      throw error;
    }
  }

  async stopListening(): Promise<void> {
    if (!this.isListening) return;

    try {
      await Voice.stop();
      this.isListening = false;
      console.log('🎤 Stopped listening');
    } catch (error) {
      console.log('Error stopping voice recognition:', error);
      this.isListening = false;
    }
  }

  async cancelListening(): Promise<void> {
    if (!this.isListening) return;

    try {
      await Voice.cancel();
      this.isListening = false;
      console.log('🎤 Cancelled listening');
    } catch (error) {
      console.log('Error cancelling voice recognition:', error);
      this.isListening = false;
    }
  }

  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  async getSupportedLanguages(): Promise<string[]> {
    try {
      const languages = await Voice.getSpeechRecognitionServices();
      return languages || ['en-US'];
    } catch (error) {
      console.log('Error getting supported languages:', error);
      return ['en-US'];
    }
  }

  destroy(): void {
    if (Voice) {
      Voice.destroy().then(() => {
        Voice.removeAllListeners();
        this.isInitialized = false;
        this.isListening = false;
        console.log('🎤 Voice service destroyed');
      });
    }
  }
}

// Supported languages for the retail app
export const SUPPORTED_LANGUAGES = {
  'en-US': 'English (US)',
  'en-GB': 'English (UK)',
  'hi-IN': 'Hindi (India)',
  'es-ES': 'Spanish',
  'fr-FR': 'French',
  'de-DE': 'German',
  'it-IT': 'Italian',
  'pt-BR': 'Portuguese (Brazil)',
  'ja-JP': 'Japanese',
  'ko-KR': 'Korean',
  'zh-CN': 'Chinese (Simplified)',
};

export default VoiceService.getInstance();