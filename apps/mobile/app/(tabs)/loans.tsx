import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLoans } from '../../src/features/loans/useLoans';
import { LoanCard } from '../../src/components/LoanCard';
import { Input } from '../../src/components/Input';
import { EmptyState } from '../../src/components/EmptyState';
import { colors, radii, spacing, typography } from '../../src/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { LoanStatus } from '@miniledger/shared';

type FilterTab = 'ALL' | 'OUTSTANDING' | 'OVERDUE' | 'REPAID';

export default function LoansListScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'createdAt' | 'amount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Query parameters according to tab
  const queryParams = {
    search: search.trim() || undefined,
    status: activeTab === 'OVERDUE' ? undefined : (activeTab as any),
    isOverdue: activeTab === 'OVERDUE' ? true : undefined,
    sortBy,
    sortOrder,
  };

  const { data: loans, isLoading, isError, error, refetch, isRefetching } = useLoans(queryParams);

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

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchSection}>
        <Input
          placeholder="Search friend's name..."
          value={search}
          onChangeText={setSearch}
          leftElement={
            <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
          }
          rightElement={
            search ? (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            ) : null
          }
          containerStyle={styles.searchInputContainer}
        />

        {/* Filter Pills */}
        <View style={styles.tabBar}>
          {(['ALL', 'OUTSTANDING', 'OVERDUE', 'REPAID'] as FilterTab[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.tabButton,
                  isActive && styles.tabButtonActive,
                  tab === 'OVERDUE' && isActive && styles.tabButtonOverdue,
                  tab === 'REPAID' && isActive && styles.tabButtonRepaid,
                ]}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    isActive && styles.tabButtonTextActive,
                    tab === 'OVERDUE' && isActive && styles.tabButtonTextOverdue,
                    tab === 'REPAID' && isActive && styles.tabButtonTextRepaid,
                  ]}
                >
                  {tab === 'ALL'
                    ? 'All'
                    : tab === 'OUTSTANDING'
                      ? 'Active'
                      : tab === 'OVERDUE'
                        ? 'Overdue'
                        : 'Repaid'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Sort Bar */}
        <View style={styles.sortRow}>
          <Text style={styles.resultsCount}>
            {loans ? `${loans.length} loans found` : 'Loading...'}
          </Text>
          <TouchableOpacity onPress={toggleSort} style={styles.sortButton}>
            <Ionicons name="swap-vertical" size={14} color={colors.primary} />
            <Text style={styles.sortButtonText}>{getSortLabel()}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Loan List Content */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading loans...</Text>
        </View>
      ) : isError ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
          <Text style={styles.errorTitle}>Could not load loans</Text>
          <Text style={styles.errorSubtitle}>{(error as any)?.message}</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={loans || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title={search ? 'No Matching Loans' : 'No Loans Found'}
              description={
                search
                  ? `No loans found for "${search}". Try adjusting your search or filter.`
                  : activeTab === 'OVERDUE'
                    ? 'No overdue loans! All loans are on schedule.'
                    : activeTab === 'REPAID'
                      ? 'No loans have been marked as repaid yet.'
                      : 'You have not added any loans in this category.'
              }
              actionTitle={search ? 'Clear Search' : '+ Add Loan'}
              onAction={search ? () => setSearch('') : () => router.push('/loans/new')}
              iconName={search ? 'search-outline' : 'receipt-outline'}
            />
          }
          renderItem={({ item }) => (
            <LoanCard loan={item} onPress={() => router.push(`/loans/${item.id}` as any)} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchSection: {
    backgroundColor: colors.surface,
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  searchInputContainer: {
    marginBottom: spacing.sm,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  tabBar: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabButtonOverdue: {
    backgroundColor: colors.danger,
  },
  tabButtonRepaid: {
    backgroundColor: colors.success,
  },
  tabButtonText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
  tabButtonTextActive: {
    color: colors.textInverse,
  },
  tabButtonTextOverdue: {
    color: colors.textInverse,
  },
  tabButtonTextRepaid: {
    color: colors.textInverse,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  resultsCount: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortButtonText: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  listContent: {
    padding: spacing.base,
    paddingBottom: spacing['4xl'],
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
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
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
});
