import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { colors, radii, spacing, typography, shadows } from '../theme/tokens';
import { Button } from './Button';
import { Ionicons } from '@expo/vector-icons';

export interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmTitle?: string;
  cancelTitle?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  iconName?: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'danger' | 'success';
}

export function ConfirmationModal({
  visible,
  title,
  message,
  confirmTitle = 'Confirm',
  cancelTitle = 'Cancel',
  loading = false,
  onConfirm,
  onCancel,
  iconName = 'checkmark-circle-outline',
  variant = 'success',
}: ConfirmationModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              <View
                style={[
                  styles.iconCircle,
                  variant === 'success' && styles.iconCircleSuccess,
                  variant === 'danger' && styles.iconCircleDanger,
                ]}
              >
                <Ionicons
                  name={iconName}
                  size={24}
                  color={
                    variant === 'success'
                      ? colors.success
                      : variant === 'danger'
                        ? colors.danger
                        : colors.primary
                  }
                />
              </View>

              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              <View style={styles.buttonRow}>
                <Button
                  title={cancelTitle}
                  variant="outline"
                  size="md"
                  disabled={loading}
                  onPress={onCancel}
                  style={styles.actionButton}
                />
                <Button
                  title={confirmTitle}
                  variant={variant}
                  size="md"
                  loading={loading}
                  onPress={onConfirm}
                  style={styles.actionButton}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  content: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    ...shadows.modal,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  iconCircleSuccess: {
    backgroundColor: colors.successLight,
  },
  iconCircleDanger: {
    backgroundColor: colors.dangerLight,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  actionButton: {
    flex: 1,
  },
});
