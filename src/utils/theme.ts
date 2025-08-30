export const theme = {
  colors: {
    primary: '#6366F1',      // Modern purple
    primaryDark: '#4F46E5',
    primaryLight: '#A5B4FC',
    secondary: '#10B981',    // Green
    secondaryLight: '#6EE7B7',
    accent: '#F59E0B',       // Orange
    accentLight: '#FCD34D',
    background: '#F1F5F9',   // Cooler light gray
    backgroundGradient: ['#F8FAFC', '#F1F5F9'],
    surface: '#FFFFFF',
    surfaceGlass: 'rgba(255, 255, 255, 0.9)',
    text: '#0F172A',
    textSecondary: '#64748B',
    textLight: '#94A3B8',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    error: '#EF4444',
    errorLight: '#FCA5A5',
    success: '#10B981',
    successLight: '#6EE7B7',
    warning: '#F59E0B',
    warningLight: '#FCD34D',
    // Gradient combinations
    gradients: {
      primary: ['#6366F1', '#8B5CF6'],
      secondary: ['#10B981', '#059669'],
      accent: ['#F59E0B', '#D97706'],
      surface: ['#FFFFFF', '#F8FAFC'],
      background: ['#F8FAFC', '#E2E8F0'],
    }
  },
  shadows: {
    small: {
      shadowColor: '#6366F1',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    medium: {
      shadowColor: '#6366F1',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    large: {
      shadowColor: '#6366F1',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 12,
    },
    glow: {
      shadowColor: '#6366F1',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 8,
    },
    success: {
      shadowColor: '#10B981',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
  },
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    xl: 24,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};