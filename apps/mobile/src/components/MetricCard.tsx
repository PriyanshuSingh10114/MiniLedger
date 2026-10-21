import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, radii, spacing, typography, shadows } from '../theme/tokens.js';
import { formatPaiseToINR } from '@miniledger/shared';

export interface MetricCardProps {
  title: string;
  amountPaise: number;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'danger' | 'success' | 'primary';
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
          bgColor: colors.dangerLight,
        };
      case 'success':
        return {
          textColor: colors.successDark,
          borderColor: colors.successBorder,
          bgColor: colors.successLight,
        };
      case 'primary':
        return {
          textColor: colors.primaryDark,
          borderColor: colors.primaryLight,
          bgColor: colors.primaryLight,
        };
      case 'default':
      default:
        return {
          textColor: colors.textPrimary,
          borderColor: colors.surfaceBorder,
          bgColor: colors.surface,
        };
    }
  };

  const theme = getVariantStyles();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.bgColor, borderColor: theme.borderColor },
        style,
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {icon}
      </View>
      <Text style={[styles.amount, { color: theme.textColor }]} numberOfLines={1}>
        {formatPaiseToINR(amountPaise)}
      </Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    padding: spacing.base,
    borderWidth: 1,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amount: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.extrabold,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
