import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDashboardSummary } from '../../src/features/loans/useDashboardSummary';
import { useAuth } from '../../src/features/auth/AuthContext';
import { MetricCard } from '../../src/components/MetricCard';
import { LoanCard } from '../../src/components/LoanCard';
import { EmptyState } from '../../src/components/EmptyState';
import { Button } from '../../src/components/Button';
import { colors, radii, spacing, typography, shadows } from '../../src/theme/tokens';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: summary, isLoading, isError, error, refetch, isRefetching } = useDashboardSummary();

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading financial summary...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="cloud-offline-outline" size={56} color={colors.danger} />
        <Text style={styles.errorTitle}>Failed to Load Dashboard</Text>
        <Text style={styles.errorDescription}>
          {(error as any)?.message || 'Could not connect to the MiniLedger server'}
        </Text>
        <Button title="Retry Connection" onPress={() => refetch()} style={styles.retryButton} />
      </View>
    );
  }

  const overdueLoans =
    summary?.recentLoans.filter((l) => l.isOverdue && l.status === 'OUTSTANDING') || [];
  const hasNoLoans = summary?.totalLoansCount === 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header Profile & Quick Action */}
      <View style={styles.welcomeRow}>
        <View>
          <Text style={styles.welcomeLabel}>Welcome back,</Text>
          <Text style={styles.userPhone}>{user?.phoneNumber || 'User'}</Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/settings')}
          style={styles.profileButton}
          accessibilityRole="button"
          accessibilityLabel="Open settings"
        >
          <Ionicons name="person" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Prominent Outstanding Overview Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <Text style={styles.heroLabel}>Total Outstanding</Text>
          <Ionicons name="time-outline" size={20} color={colors.primaryLight} />
        </View>
        <Text style={styles.heroAmount}>
          ₹
          {(Number(summary?.totalOutstandingPaise || 0) / 100).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
        <Text style={styles.heroSubtext}>Across {summary?.activeLoansCount || 0} active loans</Text>

        <Button
          title="+ Add Loan"
          variant="primary"
          onPress={() => router.push('/loans/new')}
          style={styles.heroButton}
          icon={<Ionicons name="add" size={20} color={colors.primary} />}
          textStyle={styles.heroButtonText}
        />
      </View>

      {/* 2x2 Metric Grid */}
      <View style={styles.grid}>
        <View style={styles.gridRow}>
          <MetricCard
            title="Total Lent"
            amountPaise={summary?.totalLentPaise || 0}
            subtitle={`${summary?.totalLoansCount || 0} lifetime loans`}
            icon={<Ionicons name="trending-up" size={16} color={colors.primary} />}
            style={styles.gridItem}
          />
          <MetricCard
            title="Total Repaid"
            amountPaise={summary?.totalRepaidPaise || 0}
            subtitle={`${summary?.repaidLoansCount || 0} loans settled`}
            icon={<Ionicons name="checkmark-done" size={16} color={colors.success} />}
            variant="success"
            style={styles.gridItem}
          />
        </View>

        <View style={styles.gridRow}>
          <MetricCard
            title="Overdue Amount"
            amountPaise={summary?.totalOverduePaise || 0}
            subtitle={`${summary?.overdueLoansCount || 0} overdue`}
            icon={<Ionicons name="alert-circle" size={16} color={colors.danger} />}
            variant={summary?.totalOverduePaise ? 'danger' : 'default'}
            style={styles.gridItem}
          />
          <MetricCard
            title="Active Balance"
            amountPaise={summary?.totalOutstandingPaise || 0}
            subtitle={`${summary?.activeLoansCount || 0} pending repayment`}
            icon={<Ionicons name="wallet-outline" size={16} color={colors.primary} />}
            style={styles.gridItem}
          />
        </View>
      </View>

      {/* Overdue Loans Urgent Alert */}
      {overdueLoans.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.alertHeader}>
              <Ionicons name="warning" size={20} color={colors.danger} />
              <Text style={styles.alertTitle}>Overdue Loans Attention</Text>
            </View>
          </View>

          {overdueLoans.map((loan) => (
            <LoanCard
              key={loan.id}
              loan={loan}
              onPress={() => router.push(`/loans/${loan.id}` as any)}
            />
          ))}
        </View>
      )}

      {/* Recent Loans */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Loans</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/loans')}>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {hasNoLoans ? (
          <EmptyState
            title="No Loans Yet"
            description="You haven't recorded any loans. Tap '+ Add Loan' to start tracking money lent to friends."
            actionTitle="+ Add First Loan"
            onAction={() => router.push('/loans/new')}
            iconName="receipt-outline"
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
    marginTop: spacing.base,
  },
  errorDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  retryButton: {
    minWidth: 150,
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
  },
  welcomeLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  userPhone: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    backgroundColor: colors.textPrimary,
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginBottom: spacing.base,
    ...shadows.md,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    fontWeight: typography.weights.medium,
  },
  heroAmount: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.extrabold,
    color: colors.textInverse,
    marginVertical: spacing.xs,
    letterSpacing: -0.5,
  },
  heroSubtext: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginBottom: spacing.base,
  },
  heroButton: {
    backgroundColor: colors.surface,
  },
  heroButtonText: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  grid: {
    gap: spacing.md,
    marginBottom: spacing.base,
  },
  gridRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  gridItem: {
    flex: 1,
  },
  section: {
    marginTop: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  seeAllText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  alertTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.danger,
  },
});
