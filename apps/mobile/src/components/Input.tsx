import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { colors, radii, spacing, typography } from '../theme/tokens';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  containerStyle?: ViewStyle;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export function Input({
  label,
  error,
  hint,
  containerStyle,
  leftElement,
  rightElement,
  style,
  onFocus,
  onBlur,
  multiline,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          multiline && styles.inputWrapperMultiline,
          isFocused && styles.inputWrapperFocused,
          !!error && styles.inputWrapperError,
        ]}
      >
        {leftElement && (
          <View style={[styles.leftElementWrapper, multiline && styles.leftElementMultiline]}>
            {leftElement}
          </View>
        )}
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[styles.input, multiline && styles.inputMultiline, style]}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          multiline={multiline}
          {...props}
        />
        {rightElement}
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: radii.base,
    paddingHorizontal: spacing.md,
    height: 42,
  },
  inputWrapperMultiline: {
    height: 'auto',
    minHeight: 76,
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  inputWrapperError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerLight,
  },
  leftElementWrapper: {
    justifyContent: 'center',
  },
  leftElementMultiline: {
    marginTop: 2,
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    paddingVertical: 0,
    height: '100%',
  },
  inputMultiline: {
    height: 'auto',
    minHeight: 56,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: typography.sizes.xxs,
    color: colors.danger,
    marginTop: 4,
    fontWeight: typography.weights.medium,
  },
  hintText: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    marginTop: 4,
  },
});
