import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useLoans } from '../../src/features/loans/useLoans';
import { AppShell } from '../../src/components/AppShell';
import { LoanTable } from '../../src/components/LoanTable';
import { LoanCard } from '../../src/components/LoanCard';
import { Input } from '../../src/components/Input';
import { EmptyState } from '../../src/components/EmptyState';
import { colors, radii, spacing, typography, shadows } from '../../src/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { LoanStatus, Loan } from '@miniledger/shared';

type FilterTab = 'ALL' | 'OUTSTANDING' | 'OVERDUE' | 'REPAID';

export default function LoansListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ filter?: string }>();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'createdAt' | 'amount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Handle URL query filter param
  useEffect(() => {
    if (params.filter) {
      const f = params.filter.toUpperCase();
      if (f === 'OUTSTANDING' || f === 'OVERDUE' || f === 'REPAID') {
        setActiveTab(f as FilterTab);
      }
    }
  }, [params.filter]);

  // Query parameters according to tab
  const queryParams = {
    search: search.trim() || undefined,
    status: activeTab === 'OVERDUE' ? undefined : (activeTab as any),
    isOverdue: activeTab === 'OVERDUE' ? true : undefined,
    sortBy,
    sortOrder,
  };

  const { data: loans, isLoading, isError, error, refetch } = useLoans(queryParams);

  const toggleSort = () => {
    if (sortBy === 'createdAt') {
      setSortBy('dueDate');
      setSortOrder('asc');
    } else if (sortBy === 'dueDate') {
      setSortBy('amount');
      setSortOrder('desc');
    } else {
      setSortBy('createdAt');
      setSortOrder('desc');
    }
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'dueDate':
        return 'Due Date (Earliest)';
      case 'amount':
        return 'Amount (Highest)';
      case 'createdAt':
      default:
        return 'Recently Added';
    }
  };

  const getActiveNavId = () => {
    if (activeTab === 'OVERDUE') return 'overdue';
    if (activeTab === 'OUTSTANDING') return 'outstanding';
    if (activeTab === 'REPAID') return 'repaid';
    return 'loans';
  };

  return (
    <AppShell
      title="All Loans"
      subtitle="Complete ledger of money lent, remaining balances, and settlement history."
      activeNav={getActiveNavId()}
      headerAction={{
        label: "Add Loan",
        icon: <Ionicons name="add" size={16} color={colors.textInverse} />,
        onPress: () => router.push('/loans/new'),
      }}
    >
      {/* Compact Fintech Toolbar */}
      <View style={[styles.toolbar, isDesktop ? styles.toolbarDesktop : styles.toolbarMobile]}>
        {/* Search Input */}
        <View style={styles.searchWrapper}>
          <Input
            placeholder="Filter by friend's name..."
            value={search}
            onChangeText={setSearch}
            containerStyle={styles.searchContainer}
            leftElement={
              <Ionicons
                name="search"
                size={16}
                color={colors.textMuted}
                style={styles.searchIcon}
              />
            }
            rightElement={
              search ? (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              ) : null
            }
          />
        </View>

        {/* Right Section: Segmented Status Control & Sort */}
        <View style={styles.controlsRow}>
          {/* Status Tabs */}
          <View style={styles.segmentedControl}>
            {(['ALL', 'OUTSTANDING', 'OVERDUE', 'REPAID'] as FilterTab[]).map((tab) => {
              const isActive = activeTab === tab;
              const label =
                tab === 'ALL'
                  ? 'All'
                  : tab === 'OUTSTANDING'
                    ? 'Active'
                    : tab === 'OVERDUE'
                      ? 'Overdue'
                      : 'Repaid';

              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[
                    styles.segmentButton,
                    isActive && styles.segmentButtonActive,
                    tab === 'OVERDUE' && isActive && styles.segmentButtonOverdue,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentButtonText,
                      isActive && styles.segmentButtonTextActive,
                      tab === 'OVERDUE' && isActive && styles.segmentButtonTextOverdue,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Sort Button */}
          <TouchableOpacity onPress={toggleSort} style={styles.sortButton}>
            <Ionicons name="swap-vertical" size={13} color={colors.textSecondary} />
            <Text style={styles.sortButtonText}>{getSortLabel()}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Record Count Bar */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>
          {loans ? (
            <>
              Showing <Text style={styles.countBold}>{loans.length}</Text> record
              {loans.length === 1 ? '' : 's'}
              {activeTab !== 'ALL' && ` in ${activeTab.toLowerCase()}`}
            </>
          ) : (
            'Loading records...'
          )}
        </Text>
      </View>

      {/* Data Presentation */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Fetching lending records...</Text>
        </View>
      ) : isError ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.danger} />
          <Text style={styles.errorTitle}>Could not load loans</Text>
          <Text style={styles.errorSubtitle}>{(error as any)?.message}</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : loans && loans.length > 0 ? (
        isDesktop ? (
          <LoanTable
            loans={loans}
            onSelectLoan={(loan) => router.push(`/loans/${loan.id}` as any)}
          />
        ) : (
          <View style={styles.mobileList}>
            {loans.map((loan) => (
              <LoanCard
                key={loan.id}
                loan={loan}
                onPress={() => router.push(`/loans/${loan.id}` as any)}
              />
            ))}
          </View>
        )
      ) : (
        <EmptyState
          title={search ? 'No Matching Records' : 'No Loans Found'}
          description={
            search
              ? `No records found matching "${search}". Try adjusting your search query or status filter.`
              : activeTab === 'OVERDUE'
                ? 'Great news! No overdue loans are pending payment.'
                : activeTab === 'REPAID'
                  ? 'No settled loans recorded yet. Repaid loans will appear here.'
                  : 'You have not added any loans yet. Click "+ Add Loan" above to create your first lending record.'
          }
          actionTitle={search ? 'Clear Search' : '+ Add Loan'}
          onAction={search ? () => setSearch('') : () => router.push('/loans/new')}
          iconName={search ? 'search-outline' : 'receipt-outline'}
        />
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.md,
    gap: spacing.md,
    ...shadows.xs,
  },
  toolbarDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toolbarMobile: {
    flexDirection: 'column',
  },
  searchWrapper: {
    flex: 1,
    maxWidth: 360,
  },
  searchContainer: {
    marginBottom: 0,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.base,
    padding: 3,
    gap: 2,
  },
  segmentButton: {
    paddingVertical: 5,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
  },
  segmentButtonActive: {
    backgroundColor: colors.surface,
    ...shadows.xs,
  },
  segmentButtonOverdue: {
    backgroundColor: colors.dangerLight,
  },
  segmentButtonText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  segmentButtonTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  segmentButtonTextOverdue: {
    color: colors.dangerDark,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radii.base,
    height: 34,
  },
  sortButtonText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  countRow: {
    marginBottom: spacing.md,
    paddingHorizontal: 2,
  },
  countText: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
  },
  countBold: {
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
  },
  mobileList: {
    gap: spacing.xs,
  },
  centerContainer: {
    padding: spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 250,
  },
  loadingText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  errorTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  errorSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  retryButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.base,
    backgroundColor: colors.primaryLight,
  },
  retryText: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
});
