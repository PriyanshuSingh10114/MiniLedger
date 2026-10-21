import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLoanDetails } from '../../src/features/loans/useLoanDetails.js';
import { useRepayLoan } from '../../src/features/loans/useRepayLoan.js';
import { Badge } from '../../src/components/Badge.js';
import { Button } from '../../src/components/Button.js';
import { ConfirmationModal } from '../../src/components/ConfirmationModal.js';
import { colors, radii, spacing, typography, shadows } from '../../src/theme/tokens.js';
import { formatPaiseToINR, formatDateForDisplay } from '@miniledger/shared';
import { Ionicons } from '@expo/vector-icons';

export default function LoanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: loan, isLoading, isError, error } = useLoanDetails(id);
  const repayMutation = useRepayLoan(id);

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading loan details...</Text>
      </View>
    );
  }

  if (isError || !loan) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={56} color={colors.danger} />
        <Text style={styles.errorTitle}>Loan Not Found</Text>
        <Text style={styles.errorText}>
          {(error as any)?.message || 'This loan does not exist or was deleted.'}
        </Text>
        <Button title="Go Back" onPress={() => router.back()} style={styles.backButton} />
      </View>
    );
  }

  const isRepaid = loan.status === 'REPAID';
  const isOverdue = loan.isOverdue && !isRepaid;

  const handleConfirmRepay = async () => {
    try {
      await repayMutation.mutateAsync(undefined);
      setConfirmModalVisible(false);
      Alert.alert(
        'Loan Settled',
        `The loan to ${loan.friendName} has been marked as fully repaid!`,
      );
    } catch (err: any) {
      Alert.alert('Repayment Failed', err?.message || 'Could not record repayment');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header Profile Card */}
      <View
        style={[
          styles.headerCard,
          isOverdue && styles.headerCardOverdue,
          isRepaid && styles.headerCardRepaid,
        ]}
      >
        <View style={styles.avatarRow}>
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
          <View style={styles.headerInfo}>
            <Text style={styles.friendName}>{loan.friendName}</Text>
            <Text style={styles.createdDate}>
              Recorded on {formatDateForDisplay(loan.createdAt)}
            </Text>
          </View>
          <Badge status={isRepaid ? 'REPAID' : isOverdue ? 'OVERDUE' : 'OUTSTANDING'} />
        </View>

        <View style={styles.divider} />

        {/* Balance Breakdown */}
        <View style={styles.balanceGrid}>
          <View style={styles.balanceCol}>
            <Text style={styles.balanceLabel}>Original Lent</Text>
            <Text style={styles.balanceValue}>{formatPaiseToINR(loan.amount)}</Text>
          </View>

          <View style={styles.balanceCol}>
            <Text style={styles.balanceLabel}>Total Repaid</Text>
            <Text style={[styles.balanceValue, styles.repaidValue]}>
              {formatPaiseToINR(loan.repaidAmount)}
            </Text>
          </View>

          <View style={styles.balanceCol}>
            <Text style={styles.balanceLabel}>Outstanding</Text>
            <Text style={[styles.balanceValue, isOverdue && styles.overdueValue]}>
              {formatPaiseToINR(loan.outstandingAmount)}
            </Text>
          </View>
        </View>
      </View>

      {/* Due Date Info Banner */}
      <View
        style={[
          styles.banner,
          isOverdue ? styles.bannerOverdue : isRepaid ? styles.bannerRepaid : styles.bannerNeutral,
        ]}
      >
        <Ionicons
          name={isOverdue ? 'alert-circle' : isRepaid ? 'checkmark-circle' : 'calendar'}
          size={20}
          color={isOverdue ? colors.danger : isRepaid ? colors.success : colors.primary}
        />
        <Text
          style={[
            styles.bannerText,
            isOverdue && styles.bannerTextOverdue,
            isRepaid && styles.bannerTextRepaid,
          ]}
        >
          {isRepaid
            ? 'This loan is fully settled.'
            : isOverdue
              ? `Payment was due on ${formatDateForDisplay(loan.dueDate)} and is OVERDUE.`
              : `Repayment is scheduled on ${formatDateForDisplay(loan.dueDate)}.`}
        </Text>
      </View>

      {/* Note Section if exists */}
      {loan.note ? (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Note / Reason</Text>
          <Text style={styles.noteText}>{loan.note}</Text>
        </View>
      ) : null}

      {/* Repayment History */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Repayment History</Text>
        {loan.repayments && loan.repayments.length > 0 ? (
          loan.repayments.map((r, idx) => (
            <View key={r.id || idx} style={styles.repaymentItem}>
              <View style={styles.repaymentLeft}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <View>
                  <Text style={styles.repaymentDate}>{formatDateForDisplay(r.repaidAt)}</Text>
                  <Text style={styles.repaymentSub}>Full repayment settled</Text>
                </View>
              </View>
              <Text style={styles.repaymentAmount}>+{formatPaiseToINR(r.amount)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyRepaymentsText}>No repayments recorded yet.</Text>
        )}
      </View>

      {/* Mark As Repaid CTA */}
      {!isRepaid && (
        <View style={styles.actionContainer}>
          <Button
            title={`Mark as Fully Repaid (${formatPaiseToINR(loan.outstandingAmount)})`}
            variant="success"
            size="lg"
            onPress={() => setConfirmModalVisible(true)}
            icon={<Ionicons name="checkmark-done" size={20} color={colors.textInverse} />}
          />
        </View>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationModal
        visible={confirmModalVisible}
        title="Confirm Repayment"
        message={`Has ${loan.friendName} repaid the entire outstanding balance of ${formatPaiseToINR(loan.outstandingAmount)}? This will mark the loan as settled.`}
        confirmTitle="Yes, Mark Repaid"
        cancelTitle="Cancel"
        loading={repayMutation.isPending}
        onConfirm={handleConfirmRepay}
        onCancel={() => setConfirmModalVisible(false)}
        variant="success"
        iconName="cash-outline"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.base,
    paddingBottom: spacing['4xl'],
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  errorTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  errorText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  backButton: {
    minWidth: 140,
  },
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    ...shadows.sm,
    marginBottom: spacing.base,
  },
  headerCardOverdue: {
    borderColor: colors.dangerBorder,
  },
  headerCardRepaid: {
    borderColor: colors.successBorder,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
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
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  avatarTextOverdue: {
    color: colors.danger,
  },
  avatarTextRepaid: {
    color: colors.success,
  },
  headerInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  createdDate: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: spacing.lg,
  },
  balanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceCol: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  repaidValue: {
    color: colors.successDark,
  },
  overdueValue: {
    color: colors.dangerDark,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.base,
    marginBottom: spacing.base,
    gap: spacing.sm,
  },
  bannerNeutral: {
    backgroundColor: colors.primaryLight,
  },
  bannerOverdue: {
    backgroundColor: colors.dangerLight,
  },
  bannerRepaid: {
    backgroundColor: colors.successLight,
  },
  bannerText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.primaryDark,
    fontWeight: typography.weights.medium,
  },
  bannerTextOverdue: {
    color: colors.dangerDark,
  },
  bannerTextRepaid: {
    color: colors.successDark,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  sectionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  noteText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  repaymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  repaymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  repaymentDate: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  repaymentSub: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  repaymentAmount: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.successDark,
  },
  emptyRepaymentsText: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  actionContainer: {
    marginTop: spacing.md,
  },
});
