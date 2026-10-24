import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Platform } from 'react-native';
import { colors, radii, spacing, typography, shadows } from '../theme/tokens';
import { formatPaiseToINR } from '@miniledger/shared';

export interface MetricCardProps {
  title: string;
  amountPaise: number;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'danger' | 'success' | 'info';
  style?: ViewStyle;
}

export function MetricCard({
  title,
  amountPaise,
  subtitle,
  icon,
  variant = 'default',
  style,
}: MetricCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          textColor: colors.dangerDark,
          borderColor: colors.dangerBorder,
          badgeBg: colors.dangerLight,
        };
      case 'success':
        return {
          textColor: colors.successDark,
          borderColor: colors.surfaceBorder,
          badgeBg: colors.successLight,
        };
      case 'info':
        return {
          textColor: colors.primary,
          borderColor: colors.surfaceBorder,
          badgeBg: colors.primaryLight,
        };
      case 'default':
      default:
        return {
          textColor: colors.textPrimary,
          borderColor: colors.surfaceBorder,
          badgeBg: colors.surfaceSubtle,
        };
    }
  };

  const theme = getVariantStyles();

  return (
    <View style={[styles.card, { borderColor: theme.borderColor }, style]}>
      <View style={styles.topRow}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {icon && <View style={[styles.iconContainer, { backgroundColor: theme.badgeBg }]}>{icon}</View>}
      </View>

      <Text
        style={[
          styles.amount,
          { color: theme.textColor },
          Platform.OS === 'web' && ({ fontVariant: ['tabular-nums'] } as any),
        ]}
        numberOfLines={1}
      >
        {formatPaiseToINR(amountPaise)}
      </Text>

      {subtitle ? (
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.base,
    borderWidth: 1,
    minHeight: 110,
    justifyContent: 'space-between',
    ...shadows.xs,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    letterSpacing: 0.1,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amount: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    letterSpacing: -0.4,
    marginVertical: 4,
  },
  subtitle: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
  },
});
