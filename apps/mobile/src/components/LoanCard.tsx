import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, radii, spacing, typography, shadows } from '../theme/tokens';
import { Badge } from './Badge';
import { formatPaiseToINR, formatDateForDisplay, Loan } from '@miniledger/shared';
import { Ionicons } from '@expo/vector-icons';

export interface LoanCardProps {
  loan: Loan;
  onPress: () => void;
}

export function LoanCard({ loan, onPress }: LoanCardProps) {
  const getBadgeStatus = () => {
    if (loan.status === 'REPAID') return 'REPAID';
    if (loan.isOverdue) return 'OVERDUE';
    return 'OUTSTANDING';
  };

  const isRepaid = loan.status === 'REPAID';
  const isOverdue = loan.isOverdue && !isRepaid;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.card, isOverdue && styles.cardOverdue, isRepaid && styles.cardRepaid]}
      accessibilityRole="button"
      accessibilityLabel={`Loan to ${loan.friendName}, Amount ${formatPaiseToINR(loan.amount)}`}
    >
      <View style={styles.topRow}>
        <View style={styles.friendInfo}>
          <View
            style={[
              styles.avatar,
              isOverdue && styles.avatarOverdue,
              isRepaid && styles.avatarRepaid,
            ]}
          >
            <Text
              style={[
                styles.avatarText,
                isOverdue && styles.avatarTextOverdue,
                isRepaid && styles.avatarTextRepaid,
              ]}
            >
              {loan.friendName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.friendName} numberOfLines={1}>
              {loan.friendName}
            </Text>
            <Text style={styles.dateText}>Due: {formatDateForDisplay(loan.dueDate)}</Text>
          </View>
        </View>

        <Badge status={getBadgeStatus()} />
      </View>

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.amountLabel}>Total Lent</Text>
          <Text style={styles.amountValue}>{formatPaiseToINR(loan.amount)}</Text>
        </View>

        <View style={styles.outstandingContainer}>
          <Text style={styles.amountLabel}>Outstanding</Text>
          <Text
            style={[
              styles.outstandingValue,
              isOverdue && styles.outstandingValueOverdue,
              isRepaid && styles.outstandingValueRepaid,
            ]}
          >
            {formatPaiseToINR(loan.outstandingAmount)}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    ...shadows.sm,
  },
  cardOverdue: {
    borderColor: colors.dangerBorder,
    backgroundColor: '#FFFBFB',
  },
  cardRepaid: {
    borderColor: colors.successBorder,
    backgroundColor: '#FBFDFB',
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
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarOverdue: {
    backgroundColor: colors.dangerLight,
  },
  avatarRepaid: {
    backgroundColor: colors.successLight,
  },
  avatarText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  avatarTextOverdue: {
    color: colors.danger,
  },
  avatarTextRepaid: {
    color: colors.success,
  },
  friendName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  dateText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: spacing.md,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginBottom: 2,
  },
  amountValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  outstandingContainer: {
    alignItems: 'flex-end',
  },
  outstandingValue: {
    fontSize: typography.sizes.base,
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
