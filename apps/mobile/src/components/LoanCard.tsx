import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { colors, radii, spacing, typography, shadows } from '../theme/tokens';
import { Badge } from './Badge';
import { formatPaiseToINR, formatDateForDisplay, Loan } from '@miniledger/shared';
import { Ionicons } from '@expo/vector-icons';

export interface LoanCardProps {
  loan: Loan;
  onPress: () => void;
}

export function LoanCard({ loan, onPress }: LoanCardProps) {
  const isRepaid = loan.status === 'REPAID';
  const isOverdue = loan.isOverdue && !isRepaid;

  const badgeStatus = isRepaid ? 'REPAID' : isOverdue ? 'OVERDUE' : 'OUTSTANDING';

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[styles.card, isOverdue && styles.cardOverdue, isRepaid && styles.cardRepaid]}
      accessibilityRole="button"
      accessibilityLabel={`Loan to ${loan.friendName}, Amount ${formatPaiseToINR(loan.outstandingAmount)}`}
    >
      <View style={styles.topRow}>
        <View style={styles.friendInfo}>
          <View
            style={[
              styles.avatar,
              isOverdue ? styles.avatarOverdue : isRepaid ? styles.avatarRepaid : styles.avatarActive,
            ]}
          >
            <Text
              style={[
                styles.avatarText,
                isOverdue ? styles.avatarTextOverdue : isRepaid ? styles.avatarTextRepaid : styles.avatarTextActive,
              ]}
            >
              {loan.friendName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.friendName} numberOfLines={1}>
              {loan.friendName}
            </Text>
            <View style={styles.dateRow}>
              <Ionicons
                name={isOverdue ? 'alert-circle-outline' : 'calendar-outline'}
                size={12}
                color={isOverdue ? colors.danger : colors.textMuted}
              />
              <Text style={[styles.dateText, isOverdue && styles.dateTextOverdue]}>
                Due {formatDateForDisplay(loan.dueDate)}
              </Text>
            </View>
          </View>
        </View>

        <Badge status={badgeStatus} size="sm" />
      </View>

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.amountLabel}>Original Lent</Text>
          <Text
            style={[
              styles.amountValue,
              Platform.OS === 'web' && ({ fontVariant: ['tabular-nums'] } as any),
            ]}
          >
            {formatPaiseToINR(loan.amount)}
          </Text>
        </View>

        <View style={styles.outstandingContainer}>
          <Text style={styles.amountLabel}>Outstanding</Text>
          <Text
            style={[
              styles.outstandingValue,
              isOverdue && styles.outstandingValueOverdue,
              isRepaid && styles.outstandingValueRepaid,
              Platform.OS === 'web' && ({ fontVariant: ['tabular-nums'] } as any),
            ]}
          >
            {formatPaiseToINR(loan.outstandingAmount)}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    ...shadows.xs,
  },
  cardOverdue: {
    borderColor: colors.dangerBorder,
    backgroundColor: '#FFFDFD',
  },
  cardRepaid: {
    borderColor: colors.successBorder,
    backgroundColor: '#FDFEFE',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarActive: {
    backgroundColor: colors.primaryLight,
  },
  avatarOverdue: {
    backgroundColor: colors.dangerLight,
  },
  avatarRepaid: {
    backgroundColor: colors.successLight,
  },
  avatarText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  avatarTextActive: {
    color: colors.primary,
  },
  avatarTextOverdue: {
    color: colors.danger,
  },
  avatarTextRepaid: {
    color: colors.success,
  },
  nameContainer: {
    flex: 1,
  },
  friendName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  dateText: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
  },
  dateTextOverdue: {
    color: colors.dangerDark,
    fontWeight: typography.weights.medium,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorderSubtle,
    marginVertical: spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountLabel: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    marginBottom: 2,
  },
  amountValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  outstandingContainer: {
    alignItems: 'flex-end',
  },
  outstandingValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  outstandingValueOverdue: {
    color: colors.dangerDark,
  },
  outstandingValueRepaid: {
    color: colors.successDark,
  },
});
