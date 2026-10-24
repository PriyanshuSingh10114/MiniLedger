import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { colors, radii, spacing, typography, shadows } from '../theme/tokens';
import { Badge } from './Badge';
import { formatPaiseToINR, formatDateForDisplay, Loan } from '@miniledger/shared';
import { Ionicons } from '@expo/vector-icons';

export interface LoanTableProps {
  loans: Loan[];
  onSelectLoan: (loan: Loan) => void;
}

export function LoanTable({ loans, onSelectLoan }: LoanTableProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <View style={styles.tableContainer}>
      {/* Table Header */}
      <View style={styles.tableHeaderRow}>
        <View style={[styles.th, styles.colFriend]}>
          <Text style={styles.thText}>Friend / Contact</Text>
        </View>
        <View style={[styles.th, styles.colAmount]}>
          <Text style={[styles.thText, styles.alignRight]}>Original Lent</Text>
        </View>
        <View style={[styles.th, styles.colOutstanding]}>
          <Text style={[styles.thText, styles.alignRight]}>Outstanding</Text>
        </View>
        <View style={[styles.th, styles.colDueDate]}>
          <Text style={styles.thText}>Due Date</Text>
        </View>
        <View style={[styles.th, styles.colStatus]}>
          <Text style={styles.thText}>Status</Text>
        </View>
        <View style={[styles.th, styles.colAction]}>
          <Text style={[styles.thText, styles.alignRight]}>Action</Text>
        </View>
      </View>

      {/* Table Body */}
      {loans.map((loan, index) => {
        const isRepaid = loan.status === 'REPAID';
        const isOverdue = loan.isOverdue && !isRepaid;
        const isHovered = hoveredId === loan.id;
        const isLast = index === loans.length - 1;

        const badgeStatus = isRepaid ? 'REPAID' : isOverdue ? 'OVERDUE' : 'OUTSTANDING';

        return (
          <Pressable
            key={loan.id}
            onPress={() => onSelectLoan(loan)}
            onHoverIn={() => setHoveredId(loan.id)}
            onHoverOut={() => setHoveredId(null)}
            style={[
              styles.tableRow,
              isHovered && styles.tableRowHovered,
              isLast && styles.tableRowLast,
              isOverdue && styles.tableRowOverdue,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`View loan to ${loan.friendName}`}
          >
            {/* Col: Friend */}
            <View style={[styles.td, styles.colFriend]}>
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
              <View style={styles.friendDetails}>
                <Text style={styles.friendName} numberOfLines={1}>
                  {loan.friendName}
                </Text>
                {loan.note ? (
                  <Text style={styles.loanNote} numberOfLines={1}>
                    {loan.note}
                  </Text>
                ) : (
                  <Text style={styles.dateSubtext}>
                    Added {formatDateForDisplay(loan.createdAt)}
                  </Text>
                )}
              </View>
            </View>

            {/* Col: Original Amount */}
            <View style={[styles.td, styles.colAmount]}>
              <Text
                style={[
                  styles.amountText,
                  styles.alignRight,
                  Platform.OS === 'web' && ({ fontVariant: ['tabular-nums'] } as any),
                ]}
              >
                {formatPaiseToINR(loan.amount)}
              </Text>
            </View>

            {/* Col: Outstanding */}
            <View style={[styles.td, styles.colOutstanding]}>
              <Text
                style={[
                  styles.outstandingText,
                  styles.alignRight,
                  isOverdue && styles.outstandingOverdue,
                  isRepaid && styles.outstandingRepaid,
                  Platform.OS === 'web' && ({ fontVariant: ['tabular-nums'] } as any),
                ]}
              >
                {formatPaiseToINR(loan.outstandingAmount)}
              </Text>
            </View>

            {/* Col: Due Date */}
            <View style={[styles.td, styles.colDueDate]}>
              <View style={styles.dueDateWrapper}>
                <Ionicons
                  name={isOverdue ? 'alert-circle-outline' : 'calendar-outline'}
                  size={14}
                  color={isOverdue ? colors.danger : colors.textMuted}
                />
                <Text style={[styles.dueDateText, isOverdue && styles.dueDateOverdue]}>
                  {formatDateForDisplay(loan.dueDate)}
                </Text>
              </View>
            </View>

            {/* Col: Status */}
            <View style={[styles.td, styles.colStatus]}>
              <Badge status={badgeStatus} size="sm" />
            </View>

            {/* Col: Action */}
            <View style={[styles.td, styles.colAction]}>
              <View style={styles.actionButton}>
                <Text style={styles.actionButtonText}>View</Text>
                <Ionicons name="chevron-forward" size={13} color={colors.primary} />
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tableContainer: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
    ...shadows.xs,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
    paddingHorizontal: spacing.base,
    height: 40,
  },
  th: {
    paddingVertical: 4,
  },
  thText: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    height: 60,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorderSubtle,
  },
  tableRowHovered: {
    backgroundColor: colors.surfaceHover,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableRowOverdue: {
    backgroundColor: '#FFFDFD',
  },
  td: {
    justifyContent: 'center',
  },
  colFriend: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  colAmount: {
    flex: 2,
    alignItems: 'flex-end',
    paddingRight: spacing.md,
  },
  colOutstanding: {
    flex: 2,
    alignItems: 'flex-end',
    paddingRight: spacing.md,
  },
  colDueDate: {
    flex: 2.2,
    paddingLeft: spacing.sm,
  },
  colStatus: {
    flex: 1.8,
  },
  colAction: {
    flex: 1.2,
    alignItems: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: typography.sizes.xs,
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
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  loanNote: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    marginTop: 1,
  },
  dateSubtext: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    marginTop: 1,
  },
  alignRight: {
    textAlign: 'right',
  },
  amountText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  outstandingText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  outstandingOverdue: {
    color: colors.dangerDark,
  },
  outstandingRepaid: {
    color: colors.successDark,
  },
  dueDateWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dueDateText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  dueDateOverdue: {
    color: colors.dangerDark,
    fontWeight: typography.weights.medium,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radii.xs,
  },
  actionButtonText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
});
