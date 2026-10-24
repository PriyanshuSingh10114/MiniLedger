import React from 'react';
import { View, StyleSheet, ViewProps, ViewStyle } from 'react-native';
import { colors, radii, spacing, shadows } from '../theme/tokens';

export interface CardProps extends ViewProps {
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'flat';
  children: React.ReactNode;
}

export function Card({ style, variant = 'elevated', children, ...props }: CardProps) {
  return (
    <View
      style={[
        styles.base,
        variant === 'elevated' && styles.elevated,
        variant === 'outlined' && styles.outlined,
        variant === 'flat' && styles.flat,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.base,
  },
  elevated: {
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  outlined: {
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
  },
  flat: {
    backgroundColor: colors.surfaceSubtle,
  },
});
