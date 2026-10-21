export const colors = {
  primary: '#4F46E5', // Indigo 600
  primaryDark: '#3730A3', // Indigo 800
  primaryLight: '#EEF2FF', // Indigo 50
  primaryHover: '#4338CA',

  background: '#F8FAFC', // Slate 50
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9', // Slate 100
  surfaceBorder: '#E2E8F0', // Slate 200

  textPrimary: '#0F172A', // Slate 900
  textSecondary: '#475569', // Slate 600
  textMuted: '#94A3B8', // Slate 400
  textInverse: '#FFFFFF',

  // Status Colors
  success: '#10B981', // Emerald 500
  successDark: '#047857',
  successLight: '#ECFDF5',
  successBorder: '#A7F3D0',

  danger: '#EF4444', // Red 500
  dangerDark: '#B91C1C',
  dangerLight: '#FEF2F2',
  dangerBorder: '#FECACA',

  warning: '#F59E0B', // Amber 500
  warningDark: '#B45309',
  warningLight: '#FFFBEB',
  warningBorder: '#FDE68A',

  info: '#0EA5E9', // Sky 500
  infoLight: '#F0F9FF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};

export const radii = {
  xs: 4,
  sm: 6,
  md: 8,
  base: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
};
