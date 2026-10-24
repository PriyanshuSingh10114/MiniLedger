/**
 * MiniLedger Design System Tokens
 * Editorial, restrained fintech design tokens inspired by Linear, Stripe, and modern banking platforms.
 */

export const colors = {
  // Brand & Primary
  primary: '#4338CA', // Indigo 700 - Deep, professional
  primaryDark: '#312E81', // Indigo 900
  primaryLight: '#EEF2FF', // Indigo 50
  primaryHover: '#3730A3', // Indigo 800
  primaryBorder: '#C7D2FE', // Indigo 200

  // Neutral Surfaces & Canvas
  background: '#F8FAFC', // Slate 50 - Soft neutral backdrop
  surface: '#FFFFFF', // Pure White surface
  surfaceSubtle: '#F1F5F9', // Slate 100 - Dividers and secondary areas
  surfaceHover: '#F8FAFC', // Slate 50 - Table row hover
  surfaceBorder: '#E2E8F0', // Slate 200 - Crisp subtle hairline
  surfaceBorderSubtle: '#F1F5F9', // Slate 100

  // Sidebar & Dark Chrome
  sidebarBg: '#0F172A', // Slate 900
  sidebarHover: '#1E293B', // Slate 800
  sidebarActive: '#334155', // Slate 700
  sidebarBorder: '#1E293B',
  sidebarText: '#94A3B8', // Slate 400
  sidebarTextActive: '#FFFFFF',

  // Typography
  textPrimary: '#0F172A', // Slate 900 - High contrast, legible
  textSecondary: '#475569', // Slate 600 - Editorial subtext
  textMuted: '#94A3B8', // Slate 400 - Captions and placeholders
  textInverse: '#FFFFFF',

  // Status & Financial Semantics
  // Success (Settled / Repaid)
  success: '#059669', // Emerald 600
  successDark: '#047857', // Emerald 700
  successLight: '#ECFDF5', // Emerald 50
  successBorder: '#A7F3D0', // Emerald 200

  // Danger / Overdue
  danger: '#DC2626', // Red 600
  dangerDark: '#B91C1C', // Red 700
  dangerLight: '#FEF2F2', // Red 50
  dangerBorder: '#FECACA', // Red 200

  // Warning / Attention
  warning: '#D97706', // Amber 600
  warningDark: '#B45309', // Amber 700
  warningLight: '#FFFBEB', // Amber 50
  warningBorder: '#FDE68A', // Amber 200

  // Informational / Pending
  info: '#2563EB', // Blue 600
  infoLight: '#EFF6FF', // Blue 50
  infoBorder: '#BFDBFE', // Blue 200
};

export const spacing = {
  xxs: 2,
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
  none: 0,
  xs: 2,
  sm: 4,
  md: 6,
  base: 8,
  lg: 10,
  xl: 12,
  modal: 16,
  full: 9999,
};

export const typography = {
  sizes: {
    xxs: 11,
    xs: 12,
    sm: 13,
    base: 14,
    md: 15,
    lg: 16,
    xl: 18,
    '2xl': 22,
    '3xl': 26,
    '4xl': 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 4,
  },
  modal: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
};
