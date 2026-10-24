import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radii, spacing, typography, shadows } from '../theme/tokens';
import { Button } from './Button';
import { Ionicons } from '@expo/vector-icons';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionTitle?: string;
  onAction?: () => void;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export function EmptyState({
  title,
  description,
  actionTitle,
  onAction,
  iconName = 'wallet-outline',
}: EmptyStateProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Ionicons name={iconName} size={24} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionTitle && onAction && (
        <Button
          title={actionTitle}
          size="sm"
          onPress={onAction}
          icon={<Ionicons name="add" size={14} color={colors.textInverse} />}
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginVertical: spacing.md,
    ...shadows.xs,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  description: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 380,
    marginBottom: spacing.base,
  },
  button: {
    minWidth: 130,
  },
});
