import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDashboardSummary } from '../../src/features/loans/useDashboardSummary';
import { AppShell } from '../../src/components/AppShell';
import { MetricCard } from '../../src/components/MetricCard';
import { LoanTable } from '../../src/components/LoanTable';
import { LoanCard } from '../../src/components/LoanCard';
import { EmptyState } from '../../src/components/EmptyState';
import { Button } from '../../src/components/Button';
import { colors, radii, spacing, typography, shadows } from '../../src/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { formatPaiseToINR, formatDateForDisplay, Loan } from '@miniledger/shared';

export default function DashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const { data: summary, isLoading, isError, error, refetch } = useDashboardSummary();

  if (isLoading) {
    return (
      <AppShell title="Overview" subtitle="Loading your financial ledger..." activeNav="overview">
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading financial summary...</Text>
        </View>
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell title="Overview" subtitle="Financial summary" activeNav="overview">
        <View style={styles.centerContainer}>
          <Ionicons name="cloud-offline-outline" size={48} color={colors.danger} />
          <Text style={styles.errorTitle}>Failed to Load Dashboard</Text>
          <Text style={styles.errorDescription}>
            {(error as any)?.message || 'Could not connect to the MiniLedger server'}
          </Text>
          <Button title="Retry Connection" size="sm" onPress={() => refetch()} />
        </View>
      </AppShell>
    );
  }

  const overdueLoans =
    summary?.recentLoans.filter((l) => l.isOverdue && l.status === 'OUTSTANDING') || [];
  const hasNoLoans = summary?.totalLoansCount === 0;

  return (
    <AppShell
      title="Overview"
      subtitle="Track your active receivables, outstanding loans, and repayment status."
      activeNav="overview"
      headerAction={{
        label: "Add Loan",
        icon: <Ionicons name="add" size={16} color={colors.textInverse} />,
        onPress: () => router.push('/loans/new'),
      }}
    >
      {/* 4 Financial Summary Metric Cards */}
      <View style={[styles.metricsGrid, isDesktop ? styles.metricsGridDesktop : styles.metricsGridMobile]}>
        <MetricCard
          title="Total Lent"
          amountPaise={summary?.totalLentPaise || 0}
          subtitle={`${summary?.totalLoansCount || 0} lifetime loans issued`}
          icon={<Ionicons name="trending-up" size={14} color={colors.primary} />}
          variant="default"
          style={styles.metricCardItem}
        />
        <MetricCard
          title="Total Repaid"
          amountPaise={summary?.totalRepaidPaise || 0}
          subtitle={`${summary?.repaidLoansCount || 0} settled (${
            summary?.totalLentPaise
              ? Math.round(((summary.totalRepaidPaise || 0) / summary.totalLentPaise) * 100)
              : 0
          }% recovery)`}
          icon={<Ionicons name="checkmark-done" size={14} color={colors.success} />}
          variant="success"
          style={styles.metricCardItem}
        />
        <MetricCard
          title="Outstanding Balance"
          amountPaise={summary?.totalOutstandingPaise || 0}
          subtitle={`${summary?.activeLoansCount || 0} loans pending repayment`}
          icon={<Ionicons name="wallet-outline" size={14} color={colors.primary} />}
          variant="info"
          style={styles.metricCardItem}
        />
        <MetricCard
          title="Overdue Amount"
          amountPaise={summary?.totalOverduePaise || 0}
          subtitle={`${summary?.overdueLoansCount || 0} overdue requiring attention`}
          icon={<Ionicons name="alert-circle" size={14} color={colors.danger} />}
          variant={summary?.totalOverduePaise ? 'danger' : 'default'}
          style={styles.metricCardItem}
        />
      </View>

      {/* Needs Attention Section (Overdue Loans) */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleGroup}>
            <View
              style={[
                styles.sectionIconBadge,
                overdueLoans.length > 0 ? styles.badgeDanger : styles.badgeSuccess,
              ]}
            >
              <Ionicons
                name={overdueLoans.length > 0 ? 'alert-circle' : 'shield-checkmark'}
                size={14}
                color={overdueLoans.length > 0 ? colors.danger : colors.success}
              />
            </View>
            <View>
              <Text style={styles.sectionHeading}>Needs Attention</Text>
              <Text style={styles.sectionSubtext}>
                {overdueLoans.length > 0
                  ? `${overdueLoans.length} loan${
                      overdueLoans.length === 1 ? '' : 's'
                    } past scheduled repayment date`
                  : 'All loan repayments are currently on schedule.'}
              </Text>
            </View>
          </View>
        </View>

        {overdueLoans.length > 0 ? (
          <View style={styles.overdueContainer}>
            {isDesktop ? (
              <LoanTable
                loans={overdueLoans}
                onSelectLoan={(loan) => router.push(`/loans/${loan.id}` as any)}
              />
            ) : (
              overdueLoans.map((loan) => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  onPress={() => router.push(`/loans/${loan.id}` as any)}
                />
              ))
            )}
          </View>
        ) : (
          <View style={styles.cleanStatusBanner}>
            <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
            <Text style={styles.cleanStatusText}>
              Zero overdue receivables. All active loans are within their repayment terms.
            </Text>
          </View>
        )}
      </View>

      {/* Recent Lending Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleGroup}>
            <View style={styles.sectionIconBadge}>
              <Ionicons name="list" size={14} color={colors.textSecondary} />
            </View>
            <View>
              <Text style={styles.sectionHeading}>Recent Lending Activity</Text>
              <Text style={styles.sectionSubtext}>Latest loan records and status updates</Text>
            </View>
          </View>

          {!hasNoLoans && (
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/loans')}
              style={styles.viewAllButton}
            >
              <Text style={styles.viewAllText}>View All Loans</Text>
              <Ionicons name="arrow-forward" size={13} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {hasNoLoans ? (
          <EmptyState
            title="No Loans Recorded Yet"
            description="Your lending ledger is empty. Record your first money lent to start tracking repayments and due dates."
            actionTitle="+ Add First Loan"
            onAction={() => router.push('/loans/new')}
            iconName="receipt-outline"
          />
        ) : isDesktop ? (
          <LoanTable
            loans={summary?.recentLoans || []}
            onSelectLoan={(loan) => router.push(`/loans/${loan.id}` as any)}
          />
        ) : (
          summary?.recentLoans.map((loan) => (
            <LoanCard
              key={loan.id}
              loan={loan}
              onPress={() => router.push(`/loans/${loan.id}` as any)}
            />
          ))
        )}
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    padding: spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
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
    marginTop: spacing.base,
  },
  errorDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.base,
  },
  metricsGrid: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  metricsGridDesktop: {
    flexDirection: 'row',
  },
  metricsGridMobile: {
    flexDirection: 'column',
  },
  metricCardItem: {
    flex: 1,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionIconBadge: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDanger: {
    backgroundColor: colors.dangerLight,
  },
  badgeSuccess: {
    backgroundColor: colors.successLight,
  },
  sectionHeading: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  sectionSubtext: {
    fontSize: typography.sizes.xxs,
    color: colors.textSecondary,
    marginTop: 1,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radii.xs,
  },
  viewAllText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  overdueContainer: {
    gap: spacing.xs,
  },
  cleanStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    padding: spacing.base,
    borderRadius: radii.base,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    ...shadows.xs,
  },
  cleanStatusText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
});
