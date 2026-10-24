import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, radii, spacing, typography } from '../theme/tokens';
import { Ionicons } from '@expo/vector-icons';

export type LoanBadgeStatus = 'OVERDUE' | 'REPAID' | 'OUTSTANDING';

export interface BadgeProps {
  status: LoanBadgeStatus;
  label?: string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function Badge({ status, label, size = 'sm', style }: BadgeProps) {
  const getBadgeConfig = () => {
    switch (status) {
      case 'OVERDUE':
        return {
          backgroundColor: colors.dangerLight,
          borderColor: colors.dangerBorder,
          textColor: colors.dangerDark,
          dotColor: colors.danger,
          iconName: 'alert-circle' as const,
          defaultLabel: 'Overdue',
        };
      case 'REPAID':
        return {
          backgroundColor: colors.successLight,
          borderColor: colors.successBorder,
          textColor: colors.successDark,
          dotColor: colors.success,
          iconName: 'checkmark-circle' as const,
          defaultLabel: 'Repaid',
        };
      case 'OUTSTANDING':
      default:
        return {
          backgroundColor: colors.primaryLight,
          borderColor: colors.primaryBorder,
          textColor: colors.primary,
          dotColor: colors.primary,
          iconName: 'time' as const,
          defaultLabel: 'Active',
        };
    }
  };

  const config = getBadgeConfig();
  const displayText = label || config.defaultLabel;
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        isSm ? styles.badgeSm : styles.badgeMd,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
        },
        style,
      ]}
      accessibilityRole="text"
      accessibilityLabel={`Status: ${displayText}`}
    >
      <View style={[styles.dot, { backgroundColor: config.dotColor }]} />
      <Text
        style={[
          styles.text,
          isSm ? styles.textSm : styles.textMd,
          { color: config.textColor },
        ]}
        numberOfLines={1}
      >
        {displayText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    gap: 5,
  },
  badgeMd: {
    paddingVertical: 4,
    paddingHorizontal: spacing.md,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radii.full,
  },
  text: {
    fontWeight: typography.weights.semibold,
    letterSpacing: 0.2,
  },
  textSm: {
    fontSize: typography.sizes.xxs,
  },
  textMd: {
    fontSize: typography.sizes.xs,
  },
});
