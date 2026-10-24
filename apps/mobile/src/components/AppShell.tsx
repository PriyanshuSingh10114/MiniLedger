import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '../features/auth/AuthContext';
import { colors, radii, spacing, typography, shadows } from '../theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';

export interface AppShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  activeNav?: 'overview' | 'loans' | 'outstanding' | 'overdue' | 'repaid' | 'settings';
  headerAction?: {
    label: string;
    icon?: React.ReactNode;
    onPress: () => void;
  };
}

export function AppShell({
  children,
  title,
  subtitle,
  activeNav = 'overview',
  headerAction,
}: AppShellProps) {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isDesktop = width >= 840;

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: 'grid-outline' as const,
      activeIcon: 'grid' as const,
      onPress: () => router.push('/(tabs)'),
    },
    {
      id: 'loans',
      label: 'All Loans',
      icon: 'receipt-outline' as const,
      activeIcon: 'receipt' as const,
      onPress: () => router.push('/(tabs)/loans'),
    },
    {
      id: 'outstanding',
      label: 'Active Receivables',
      icon: 'time-outline' as const,
      activeIcon: 'time' as const,
      onPress: () => router.push('/(tabs)/loans?filter=OUTSTANDING' as any),
    },
    {
      id: 'overdue',
      label: 'Needs Attention',
      icon: 'alert-circle-outline' as const,
      activeIcon: 'alert-circle' as const,
      badge: 'Urgent',
      onPress: () => router.push('/(tabs)/loans?filter=OVERDUE' as any),
    },
    {
      id: 'repaid',
      label: 'Settled History',
      icon: 'checkmark-done-outline' as const,
      activeIcon: 'checkmark-done' as const,
      onPress: () => router.push('/(tabs)/loans?filter=REPAID' as any),
    },
  ];

  return (
    <View style={styles.rootContainer}>
      {/* Desktop Left Navigation Sidebar */}
      {isDesktop && (
        <View style={styles.sidebar}>
          {/* Logo & Brand Header */}
          <View style={styles.brandContainer}>
            <View style={styles.logoBadge}>
              <Ionicons name="wallet" size={18} color={colors.textInverse} />
            </View>
            <View>
              <View style={styles.brandRow}>
                <Text style={styles.brandTitle}>MiniLedger</Text>
                <View style={styles.proTag}>
                  <Text style={styles.proTagText}>PRO</Text>
                </View>
              </View>
              <Text style={styles.brandSubtitle}>Receivables Ledger</Text>
            </View>
          </View>

          {/* Quick Action Button in Sidebar */}
          <View style={styles.sidebarActionContainer}>
            <Button
              title="Add New Loan"
              size="sm"
              variant="primary"
              onPress={() => router.push('/loans/new')}
              icon={<Ionicons name="add" size={16} color={colors.textInverse} />}
              style={styles.sidebarAddButton}
            />
          </View>

          {/* Primary Navigation List */}
          <View style={styles.navSection}>
            <Text style={styles.navSectionTitle}>LENDING MANAGEMENT</Text>
            {navItems.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  onPress={item.onPress}
                  style={[styles.navItem, isActive && styles.navItemActive]}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                >
                  <Ionicons
                    name={isActive ? item.activeIcon : item.icon}
                    size={17}
                    color={isActive ? colors.primary : colors.sidebarText}
                  />
                  <Text style={[styles.navItemText, isActive && styles.navItemTextActive]}>
                    {item.label}
                  </Text>
                  {item.badge ? (
                    <View style={styles.navBadge}>
                      <Text style={styles.navBadgeText}>{item.badge}</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Sidebar Bottom Footer: Settings & User Profile */}
          <View style={styles.sidebarFooter}>
            <TouchableOpacity
              onPress={() => router.push('/settings')}
              style={[styles.navItem, activeNav === 'settings' && styles.navItemActive]}
              accessibilityRole="button"
              accessibilityLabel="Settings"
            >
              <Ionicons
                name={activeNav === 'settings' ? 'settings' : 'settings-outline'}
                size={17}
                color={activeNav === 'settings' ? colors.primary : colors.sidebarText}
              />
              <Text style={[styles.navItemText, activeNav === 'settings' && styles.navItemTextActive]}>
                Settings
              </Text>
            </TouchableOpacity>

            <View style={styles.profileDivider} />

            <View style={styles.profileRow}>
              <View style={styles.avatarPill}>
                <Text style={styles.avatarPillText}>
                  {user?.phoneNumber ? user.phoneNumber.slice(-2) : 'ML'}
                </Text>
              </View>
              <View style={styles.profileTextWrapper}>
                <Text style={styles.profilePhone} numberOfLines={1}>
                  {user?.phoneNumber || '+91 User'}
                </Text>
                <Text style={styles.profileStatus}>Verified Member</Text>
              </View>
              <TouchableOpacity
                onPress={logout}
                style={styles.logoutButton}
                accessibilityRole="button"
                accessibilityLabel="Sign out"
              >
                <Ionicons name="log-out-outline" size={17} color={colors.sidebarText} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Main Content Workspace Area */}
      <View style={styles.mainArea}>
        {/* Top Header Bar */}
        <View style={styles.topHeader}>
          <View style={styles.headerLeft}>
            {!isDesktop && (
              <View style={styles.mobileBrandHeader}>
                <View style={styles.mobileLogoBadge}>
                  <Ionicons name="wallet" size={14} color={colors.textInverse} />
                </View>
                <Text style={styles.mobileBrandTitle}>MiniLedger</Text>
              </View>
            )}
            <View>
              <Text style={styles.pageTitle}>{title}</Text>
              {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
            </View>
          </View>

          <View style={styles.headerRight}>
            {headerAction ? (
              <Button
                title={headerAction.label}
                size="sm"
                variant="primary"
                onPress={headerAction.onPress}
                icon={headerAction.icon || <Ionicons name="add" size={16} color={colors.textInverse} />}
              />
            ) : null}

            {!isDesktop && (
              <TouchableOpacity
                onPress={() => router.push('/settings')}
                style={styles.mobileAvatarButton}
                accessibilityRole="button"
                accessibilityLabel="Settings"
              >
                <Ionicons name="person-circle-outline" size={26} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Scrollable Page Body */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[styles.scrollContent, isDesktop && styles.scrollContentDesktop]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.contentMaxWrapper, isDesktop && styles.contentMaxWrapperDesktop]}>
            {children}
          </View>
        </ScrollView>

        {/* Mobile Compact Bottom Navigation (< 840px) */}
        {!isDesktop && (
          <View style={styles.mobileTabBar}>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)')}
              style={styles.mobileTabItem}
            >
              <Ionicons
                name={activeNav === 'overview' ? 'grid' : 'grid-outline'}
                size={20}
                color={activeNav === 'overview' ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  styles.mobileTabLabel,
                  activeNav === 'overview' && styles.mobileTabLabelActive,
                ]}
              >
                Overview
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(tabs)/loans')}
              style={styles.mobileTabItem}
            >
              <Ionicons
                name={activeNav === 'loans' ? 'receipt' : 'receipt-outline'}
                size={20}
                color={activeNav === 'loans' ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  styles.mobileTabLabel,
                  activeNav === 'loans' && styles.mobileTabLabelActive,
                ]}
              >
                Loans
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/loans/new')}
              style={styles.mobileTabAddButton}
            >
              <Ionicons name="add" size={22} color={colors.textInverse} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/settings')}
              style={styles.mobileTabItem}
            >
              <Ionicons
                name={activeNav === 'settings' ? 'settings' : 'settings-outline'}
                size={20}
                color={activeNav === 'settings' ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  styles.mobileTabLabel,
                  activeNav === 'settings' && styles.mobileTabLabelActive,
                ]}
              >
                Settings
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.background,
  },
  sidebar: {
    width: 240,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.surfaceBorder,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.md,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.base,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: radii.base,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  proTag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radii.xs,
  },
  proTagText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    marginTop: 1,
  },
  sidebarActionContainer: {
    marginBottom: spacing.base,
    paddingHorizontal: spacing.xs,
  },
  sidebarAddButton: {
    width: '100%',
  },
  navSection: {
    flex: 1,
    gap: 3,
  },
  navSectionTitle: {
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.base,
    gap: spacing.sm,
  },
  navItemActive: {
    backgroundColor: colors.primaryLight,
  },
  navItemText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  navItemTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  navBadge: {
    backgroundColor: colors.dangerLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
  },
  navBadgeText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.dangerDark,
  },
  sidebarFooter: {
    paddingTop: spacing.sm,
  },
  profileDivider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: spacing.sm,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    gap: spacing.sm,
  },
  avatarPill: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPillText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
  },
  profileTextWrapper: {
    flex: 1,
  },
  profilePhone: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  profileStatus: {
    fontSize: 10,
    color: colors.textMuted,
  },
  logoutButton: {
    padding: 4,
  },
  mainArea: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: colors.background,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
    height: 64,
  },
  headerLeft: {
    flex: 1,
  },
  mobileBrandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  mobileLogoBadge: {
    width: 20,
    height: 20,
    borderRadius: radii.xs,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileBrandTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  pageTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  pageSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mobileAvatarButton: {
    padding: 2,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing['4xl'],
  },
  scrollContentDesktop: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  contentMaxWrapper: {
    width: '100%',
  },
  contentMaxWrapperDesktop: {
    maxWidth: 1140,
    alignSelf: 'flex-start',
  },
  mobileTabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    height: 56,
    paddingBottom: 4,
  },
  mobileTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    flex: 1,
  },
  mobileTabLabel: {
    fontSize: 10,
    fontWeight: typography.weights.medium,
    color: colors.textMuted,
  },
  mobileTabLabelActive: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  mobileTabAddButton: {
    width: 38,
    height: 38,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
});
