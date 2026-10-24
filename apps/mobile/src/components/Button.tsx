import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { colors, radii, spacing, typography } from '../theme/tokens';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'secondary':
        return styles.secondary;
      case 'outline':
        return styles.outline;
      case 'danger':
        return styles.danger;
      case 'success':
        return styles.success;
      case 'ghost':
        return styles.ghost;
      case 'primary':
      default:
        return styles.primary;
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'secondary':
        return styles.textSecondary;
      case 'outline':
        return styles.textOutline;
      case 'ghost':
        return styles.textGhost;
      case 'danger':
      case 'success':
      case 'primary':
      default:
        return styles.textPrimary;
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return styles.sizeSm;
      case 'lg':
        return styles.sizeLg;
      case 'md':
      default:
        return styles.sizeMd;
    }
  };

  const getTextSizeStyle = (): TextStyle => {
    switch (size) {
      case 'sm':
        return styles.textSizeSm;
      case 'lg':
        return styles.textSizeLg;
      case 'md':
      default:
        return styles.textSizeMd;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      disabled={isDisabled}
      style={[
        styles.base,
        getContainerStyle(),
        getSizeStyle(),
        isDisabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'secondary' || variant === 'ghost' || variant === 'outline'
              ? colors.primary
              : colors.textInverse
          }
        />
      ) : (
        <>
          {icon}
          <Text style={[styles.textBase, getTextSizeStyle(), getTextStyle(), textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.base,
    gap: spacing.sm,
  },
  sizeSm: {
    height: 34,
    paddingHorizontal: spacing.md,
  },
  sizeMd: {
    height: 40,
    paddingHorizontal: spacing.base,
  },
  sizeLg: {
    height: 46,
    paddingHorizontal: spacing.xl,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  outline: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  success: {
    backgroundColor: colors.success,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  textBase: {
    fontWeight: typography.weights.semibold,
    letterSpacing: 0.1,
  },
  textSizeSm: {
    fontSize: typography.sizes.xs,
  },
  textSizeMd: {
    fontSize: typography.sizes.sm,
  },
  textSizeLg: {
    fontSize: typography.sizes.base,
  },
  textPrimary: {
    color: colors.textInverse,
  },
  textSecondary: {
    color: colors.textPrimary,
  },
  textOutline: {
    color: colors.textPrimary,
  },
  textGhost: {
    color: colors.primary,
  },
});
