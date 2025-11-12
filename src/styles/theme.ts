export const theme = {
  colors: {
    primary: '#0066CC',
    primaryVariant: '#004C99',
    secondary: '#00D4AA',
    secondaryVariant: '#00A885',
    background: '#FFFFFF',
    backgroundDark: '#121212',
    surface: '#F5F5F5',
    surfaceDark: '#1E1E1E',
    surfaceGlass: 'rgba(255, 255, 255, 0.7)',
    surfaceGlassDark: 'rgba(30, 30, 30, 0.7)',
    error: '#DC2626',
    success: '#16A34A',
    warning: '#EA580C',
    text: '#1F2937',
    textDark: '#E5E7EB',
    textSecondary: '#6B7280',
    textSecondaryDark: '#9CA3AF',
    border: '#E5E7EB',
    borderDark: '#374151',
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.2)',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 38,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 29,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 21,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 18,
    },
  },

  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 5,
    },
  },
};

export type Theme = typeof theme;
