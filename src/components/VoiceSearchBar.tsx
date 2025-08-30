import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, Platform } from 'react-native';
import { theme } from '../utils/theme';

// Conditional import for voice - only load if available
let Voice: any = null;
let VoiceService: any = null;

try {
  Voice = require('@react-native-voice/voice').default;
  VoiceService = require('../services/voice').default;
} catch (error) {
  console.log('Voice module not available in Expo Go - using simulation mode');
}

type Props = { value: string; onChangeText: (t: string) => void; onSubmit: () => void };

export default function VoiceSearchBar({ value, onChangeText, onSubmit }: Props) {
  const [listening, setListening] = useState(false);
  const [isVoiceAvailable, setIsVoiceAvailable] = useState(false);

  useEffect(() => {
    // Only initialize voice if available (not in Expo Go)
    if (Voice && VoiceService) {
      // Initialize voice recognition
      Voice.onSpeechStart = onSpeechStart;
      Voice.onSpeechEnd = onSpeechEnd;
      Voice.onSpeechResults = onSpeechResults;
      Voice.onSpeechError = onSpeechError;
      Voice.onSpeechPartialResults = onSpeechPartialResults;

      // Initialize voice service and check availability
      const initVoice = async () => {
        try {
          const available = await VoiceService.initialize();
          setIsVoiceAvailable(available);
          console.log('🎤 Voice service initialized:', available);
        } catch (error) {
          console.log('🎤 Voice initialization failed:', error);
          setIsVoiceAvailable(false);
        }
      };

      initVoice();

      return () => {
        // Cleanup
        if (VoiceService) {
          VoiceService.destroy();
        }
      };
    } else {
      // Running in Expo Go - voice not available
      setIsVoiceAvailable(false);
      console.log('🎤 Running in Expo Go - Voice simulation mode enabled');
    }
  }, []);

  const onSpeechStart = () => {
    console.log('🎤 Speech recognition started');
    setListening(true);
  };

  const onSpeechEnd = () => {
    console.log('🎤 Speech recognition ended');
    setListening(false);
  };

  const onSpeechPartialResults = (event: any) => {
    console.log('🎤 Partial results:', event.value);
    // Optionally show partial results in real-time
    if (event.value && event.value.length > 0) {
      const partialText = event.value[0];
      // You could show this as a preview
    }
  };

  const onSpeechResults = (event: any) => {
    console.log('🎤 Final speech results:', event.value);
    setListening(false);

    if (event.value && event.value.length > 0) {
      const spokenText = event.value[0];
      console.log('🎤 Recognized text:', spokenText);

      // Update the search input
      onChangeText(spokenText);

      // Auto-submit after a short delay
      setTimeout(() => {
        onSubmit();
      }, 300);

      // Show success feedback
      Alert.alert(
        '🎤 Voice Recognized',
        `Searching for: "${spokenText}"`,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    }
  };

  const onSpeechError = (event: any) => {
    console.log('🎤 Speech error:', event.error);
    setListening(false);

    // Handle specific error types
    const errorCode = event.error?.code || event.error?.message || '';

    if (errorCode.includes('permissions') || errorCode.includes('permission')) {
      Alert.alert(
        '🎤 Microphone Permission Required',
        'Please enable microphone access in your device settings to use voice search.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Try Again', onPress: handleVoicePress }
        ]
      );
    } else if (errorCode.includes('network') || errorCode.includes('connection')) {
      Alert.alert(
        '🌐 Network Error',
        'Voice recognition requires an internet connection. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } else if (errorCode.includes('timeout') || errorCode.includes('no-speech')) {
      Alert.alert(
        '⏱️ No Speech Detected',
        'No speech was detected. Please try speaking again.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Try Again', onPress: handleVoicePress }
        ]
      );
    } else {
      Alert.alert(
        '🎤 Voice Recognition Error',
        'Could not recognize speech. Please try again or type your search.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Try Again', onPress: handleVoicePress }
        ]
      );
    }
  };

  const startListening = async () => {
    if (!VoiceService) {
      simulateVoiceInput();
      return;
    }

    try {
      setListening(true);

      // Use the voice service with enhanced configuration
      await VoiceService.startListening({
        language: 'en-US', // You can make this configurable
        timeout: 8000, // 8 seconds timeout
        partialResults: true // Enable real-time results
      });

      console.log('🎤 Voice listening started successfully');
    } catch (error) {
      console.log('🎤 Error starting voice recognition:', error);
      setListening(false);

      Alert.alert(
        '🎤 Voice Recognition Error',
        'Could not start voice recognition. Please check your microphone permissions and try again.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Try Again', onPress: startListening }
        ]
      );
    }
  };

  const stopListening = async () => {
    if (!VoiceService) return;

    try {
      await VoiceService.stopListening();
      setListening(false);
      console.log('🎤 Voice listening stopped');
    } catch (error) {
      console.log('🎤 Error stopping voice recognition:', error);
      setListening(false);
    }
  };

  // Fallback simulation for Expo Go or when voice is not available
  const simulateVoiceInput = () => {
    const sampleCommands = [
      { label: "🥞 Breakfast under 100", command: "breakfast under 100" },
      { label: "🌶️ Spices over 150", command: "spices over 150" },
      { label: "🥄 Order 2 dosa batter", command: "order 2 dosa batter" },
      { label: "🫒 Find olive oil", command: "olive oil" },
      { label: "🍯 Show honey products", command: "honey" },
      { label: "🌿 Mint chutney", command: "mint chutney" },
      { label: "🍝 Ready to eat items", command: "ready to eat" },
      { label: "🧄 Ginger garlic paste", command: "ginger garlic paste" }
    ];

    Alert.alert(
      "🎤 Voice Simulation",
      "Choose a sample command to test:",
      [
        ...sampleCommands.map(({ label, command }) => ({
          text: label,
          onPress: () => {
            console.log(`🎤 Simulating voice input: "${command}"`);
            console.log('🎤 Setting search text and triggering search...');
            onChangeText(command);
            // Add a small delay to show the text being filled
            setTimeout(() => {
              console.log('🎤 Calling onSubmit...');
              onSubmit();
            }, 200);
          }
        })),
        { text: "Cancel", style: "cancel" as const }
      ]
    );
  };

  const handleVoicePress = () => {
    if (listening) {
      stopListening();
      return;
    }

    // Check if running in Expo Go or voice not available
    if (!Voice || !VoiceService || Platform.OS === 'web' || !isVoiceAvailable) {
      Alert.alert(
        "🎤 Voice Recognition",
        "Real voice input requires a development build.\n\nTry sample commands to test the AI search:",
        [
          { text: "Try Sample Commands", onPress: simulateVoiceInput },
          { text: "Cancel", style: "cancel" as const }
        ]
      );
      return;
    }

    // Start real voice recognition
    startListening();
  };

  return (
    <View style={{
      marginBottom: theme.spacing.md,
    }}>
      {/* Glassmorphism Container */}
      <View style={{
        backgroundColor: theme.colors.surfaceGlass,
        borderRadius: theme.borderRadius.large,
        padding: theme.spacing.sm,
        ...theme.shadows.large,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: theme.borderRadius.medium,
            borderWidth: 2,
            borderColor: listening ? '#10B981' : (value ? theme.colors.primary : 'rgba(99, 102, 241, 0.2)'),
            ...theme.shadows.medium,
          }}>
            <TextInput
              placeholder={listening ? "🎤 Listening... Speak now!" : "✨ Try: 'breakfast under 200' or 'order 2 dosa batter'"}
              placeholderTextColor={listening ? '#10B981' : theme.colors.textLight}
              value={value}
              onChangeText={onChangeText}
              onSubmitEditing={onSubmit}
              editable={!listening}
              style={{
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.md,
                fontSize: 16,
                color: theme.colors.text,
                fontWeight: '500',
              }}
            />
          </View>

          <TouchableOpacity
            onPress={handleVoicePress}
            style={{
              marginLeft: theme.spacing.sm,
              width: 56,
              height: 56,
              borderRadius: 28,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: listening ? '#10B981' : theme.colors.primary,
              ...theme.shadows.glow,
              transform: listening ? [{ scale: 1.1 }] : [{ scale: 1 }],
            }}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 22 }}>
                {listening ? '🔴' : '🎤'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Status Indicator */}
        {listening && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: theme.spacing.sm,
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            paddingVertical: theme.spacing.xs,
            paddingHorizontal: theme.spacing.sm,
            borderRadius: theme.borderRadius.small,
            borderWidth: 1,
            borderColor: 'rgba(16, 185, 129, 0.3)',
          }}>
            <Text style={{
              fontSize: 12,
              color: '#10B981',
              fontWeight: '600',
            }}>
              🎤 Listening... Tap to stop
            </Text>
          </View>
        )}

        {/* Quick Actions */}
        {!listening && (
          <View style={{
            flexDirection: 'row',
            marginTop: theme.spacing.sm,
            flexWrap: 'wrap',
          }}>
            {['🥞 Breakfast', '🌶️ Spices', '🥄 Condiments', '🍝 Ready to Eat'].map((tag, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  const searchTerm = tag.split(' ')[1].toLowerCase();
                  onChangeText(searchTerm);
                  onSubmit();
                }}
                style={{
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  paddingHorizontal: theme.spacing.sm,
                  paddingVertical: 4,
                  borderRadius: theme.borderRadius.small,
                  marginRight: theme.spacing.xs,
                  borderWidth: 1,
                  borderColor: 'rgba(99, 102, 241, 0.2)',
                }}
              >
                <Text style={{
                  fontSize: 12,
                  color: theme.colors.primary,
                  fontWeight: '600',
                }}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Voice Status */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: theme.spacing.xs,
        }}>
          <Text style={{
            fontSize: 10,
            color: theme.colors.textLight,
            fontWeight: '500',
          }}>
            {isVoiceAvailable ? '🎤 Voice Ready' : '📱 Simulation Mode'}
          </Text>
        </View>
      </View>
    </View>
  );
}