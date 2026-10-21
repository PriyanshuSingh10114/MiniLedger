import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, radii, spacing, typography } from '../theme/tokens.js';

export interface BadgeProps {
  status: 'OVERDUE' | 'REPAID' | 'OUTSTANDING';
  label?: string;
  style?: ViewStyle;
}

export function Badge({ status, label, style }: BadgeProps) {
  const getBadgeConfig = () => {
    switch (status) {
      case 'OVERDUE':
        return {
          backgroundColor: colors.dangerLight,
          borderColor: colors.dangerBorder,
          textColor: colors.dangerDark,
          text: label || 'Overdue',
        };
      case 'REPAID':
        return {
          backgroundColor: colors.successLight,
          borderColor: colors.successBorder,
          textColor: colors.successDark,
          text: label || 'Repaid',
        };
      case 'OUTSTANDING':
      default:
        return {
          backgroundColor: colors.primaryLight,
          borderColor: colors.primaryHover,
          textColor: colors.primary,
          text: label || 'Active',
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: config.textColor }]}>{config.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: spacing.xs - 1,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radii.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
