import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLoanDetails } from '../../src/features/loans/useLoanDetails';
import { useRepayLoan } from '../../src/features/loans/useRepayLoan';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { ConfirmationModal } from '../../src/components/ConfirmationModal';
import { colors, radii, spacing, typography, shadows } from '../../src/theme/tokens';
import { formatPaiseToINR, formatDateForDisplay } from '@miniledger/shared';
import { Ionicons } from '@expo/vector-icons';

export default function LoanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const { data: loan, isLoading, isError, error } = useLoanDetails(id);
  const repayMutation = useRepayLoan(id);

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Retrieving loan statement...</Text>
      </View>
    );
  }

  if (isError || !loan) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
        <Text style={styles.errorTitle}>Loan Record Not Found</Text>
        <Text style={styles.errorText}>
          {(error as any)?.message || 'This loan record could not be found.'}
        </Text>
        <Button title="Back to All Loans" size="sm" onPress={() => router.back()} />
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
        `The loan to ${loan.friendName} for ${formatPaiseToINR(loan.outstandingAmount)} has been recorded as fully settled!`,
      );
    } catch (err: any) {
      Alert.alert('Repayment Failed', err?.message || 'Could not record repayment');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={[styles.maxWidthWrapper, isDesktop && styles.maxWidthWrapperDesktop]}>
        {/* Navigation Breadcrumb */}
        <View style={styles.breadcrumbRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={16} color={colors.textSecondary} />
            <Text style={styles.backText}>All Loans</Text>
          </TouchableOpacity>
          <Text style={styles.breadcrumbSep}>/</Text>
          <Text style={styles.breadcrumbCurrent}>{loan.friendName}</Text>
        </View>

        {/* Financial Statement Card */}
        <View style={styles.statementCard}>
          {/* Top Profile & Status Bar */}
          <View style={styles.headerRow}>
            <View style={styles.avatarGroup}>
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
              <View>
                <Text style={styles.friendName}>{loan.friendName}</Text>
                <Text style={styles.createdText}>
                  Recorded on {formatDateForDisplay(loan.createdAt)}
                </Text>
              </View>
            </View>

            <Badge
              status={isRepaid ? 'REPAID' : isOverdue ? 'OVERDUE' : 'OUTSTANDING'}
              size="md"
            />
          </View>

          <View style={styles.divider} />

          {/* 3-Column Financial Breakdown */}
          <View style={styles.financialMetricsRow}>
            <View style={styles.metricBlock}>
              <Text style={styles.metricLabel}>Original Lent</Text>
              <Text
                style={[
                  styles.metricValue,
                  Platform.OS === 'web' && ({ fontVariant: ['tabular-nums'] } as any),
                ]}
              >
                {formatPaiseToINR(loan.amount)}
              </Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricBlock}>
              <Text style={styles.metricLabel}>Total Settled</Text>
              <Text
                style={[
                  styles.metricValue,
                  styles.repaidValue,
                  Platform.OS === 'web' && ({ fontVariant: ['tabular-nums'] } as any),
                ]}
              >
                {formatPaiseToINR(loan.repaidAmount)}
              </Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricBlock}>
              <Text style={styles.metricLabel}>Outstanding Balance</Text>
              <Text
                style={[
                  styles.metricValue,
                  isOverdue ? styles.overdueValue : isRepaid ? styles.repaidValue : styles.activeValue,
                  Platform.OS === 'web' && ({ fontVariant: ['tabular-nums'] } as any),
                ]}
              >
                {formatPaiseToINR(loan.outstandingAmount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Due Date & Status Banner */}
        <View
          style={[
            styles.banner,
            isOverdue ? styles.bannerOverdue : isRepaid ? styles.bannerRepaid : styles.bannerNeutral,
          ]}
        >
          <Ionicons
            name={isOverdue ? 'alert-circle' : isRepaid ? 'checkmark-circle' : 'calendar'}
            size={18}
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
              ? 'This loan is fully settled. No further repayments are required.'
              : isOverdue
                ? `Repayment was due on ${formatDateForDisplay(loan.dueDate)} and is currently OVERDUE.`
                : `Repayment is scheduled by ${formatDateForDisplay(loan.dueDate)}.`}
          </Text>
        </View>

        {/* Note / Reason if present */}
        {loan.note ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Memo / Note</Text>
            <Text style={styles.noteBody}>{loan.note}</Text>
          </View>
        ) : null}

        {/* Repayment History */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Repayment History</Text>
          {loan.repayments && loan.repayments.length > 0 ? (
            loan.repayments.map((r, idx) => (
              <View key={r.id || idx} style={styles.historyRow}>
                <View style={styles.historyLeft}>
                  <View style={styles.historyIcon}>
                    <Ionicons name="checkmark-done" size={14} color={colors.success} />
                  </View>
                  <View>
                    <Text style={styles.historyDate}>
                      Repaid on {formatDateForDisplay(r.repaidAt)}
                    </Text>
                    <Text style={styles.historySubtitle}>Settled via recorded payment</Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.historyAmount,
                    Platform.OS === 'web' && ({ fontVariant: ['tabular-nums'] } as any),
                  ]}
                >
                  +{formatPaiseToINR(r.amount)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyHistory}>No repayments recorded for this loan yet.</Text>
          )}
        </View>

        {/* Mark as Repaid Action */}
        {!isRepaid && (
          <View style={styles.actionSection}>
            <Button
              title={`Mark as Fully Repaid (${formatPaiseToINR(loan.outstandingAmount)})`}
              variant="success"
              size="lg"
              loading={repayMutation.isPending}
              disabled={repayMutation.isPending}
              onPress={() => setConfirmModalVisible(true)}
              icon={<Ionicons name="checkmark-done" size={18} color={colors.textInverse} />}
              style={styles.repayButton}
            />
          </View>
        )}

        {/* Repayment Confirmation Modal */}
        <ConfirmationModal
          visible={confirmModalVisible}
          title="Confirm Loan Settlement"
          message={`Are you sure you want to record ${loan.friendName} as having repaid ${formatPaiseToINR(
            loan.outstandingAmount,
          )}? This will zero out the outstanding balance and mark the loan as Settled.`}
          confirmTitle="Yes, Mark as Repaid"
          cancelTitle="Cancel"
          loading={repayMutation.isPending}
          onConfirm={handleConfirmRepay}
          onCancel={() => setConfirmModalVisible(false)}
          variant="success"
          iconName="cash-outline"
        />
      </View>
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
    alignItems: 'center',
  },
  maxWidthWrapper: {
    width: '100%',
    maxWidth: 720,
  },
  maxWidthWrapperDesktop: {
    marginTop: spacing.md,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
    minHeight: 300,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  errorTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  errorText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: spacing.base,
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  backText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  breadcrumbSep: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  breadcrumbCurrent: {
    fontSize: typography.sizes.xs,
    color: colors.textPrimary,
    fontWeight: typography.weights.semibold,
  },
  statementCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
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
    fontSize: typography.sizes.lg,
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
  friendName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  createdText: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: spacing.lg,
  },
  financialMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricBlock: {
    flex: 1,
  },
  metricDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.surfaceBorder,
    marginHorizontal: spacing.md,
  },
  metricLabel: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  metricValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  repaidValue: {
    color: colors.successDark,
  },
  overdueValue: {
    color: colors.dangerDark,
  },
  activeValue: {
    color: colors.primary,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.base,
    marginBottom: spacing.md,
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
    fontSize: typography.sizes.xs,
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
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.md,
    ...shadows.xs,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  noteBody: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorderSubtle,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  historyIcon: {
    width: 24,
    height: 24,
    borderRadius: radii.full,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyDate: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  historySubtitle: {
    fontSize: 10,
    color: colors.textMuted,
  },
  historyAmount: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.successDark,
  },
  emptyHistory: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  actionSection: {
    marginTop: spacing.sm,
  },
  repayButton: {
    width: '100%',
  },
});
