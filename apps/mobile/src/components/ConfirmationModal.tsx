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
                  size={32}
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
                  variant="secondary"
                  disabled={loading}
                  onPress={onCancel}
                  style={styles.actionButton}
                />
                <Button
                  title={confirmTitle}
                  variant={variant}
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
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  content: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    ...shadows.lg,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  iconCircleSuccess: {
    backgroundColor: colors.successLight,
  },
  iconCircleDanger: {
    backgroundColor: colors.dangerLight,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  actionButton: {
    flex: 1,
  },
});
