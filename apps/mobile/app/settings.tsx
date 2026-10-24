import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, useWindowDimensions } from 'react-native';
import { useAuth } from '../src/features/auth/AuthContext';
import { AppShell } from '../src/components/AppShell';
import { Button } from '../src/components/Button';
import { ConfirmationModal } from '../src/components/ConfirmationModal';
import { colors, radii, spacing, typography, shadows } from '../src/theme/tokens';
import { API_BASE_URL } from '../src/lib/api';
import { formatDateForDisplay } from '@miniledger/shared';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      setLogoutModalVisible(false);
    } catch {
      Alert.alert('Logout Error', 'An error occurred during logout');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <AppShell
      title="Settings & System"
      subtitle="Manage your profile, active session, and system security credentials."
      activeNav="settings"
    >
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={24} color={colors.primary} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.phoneText}>{user?.phoneNumber || 'User'}</Text>
              <Text style={styles.idText}>Account ID: {user?.id?.slice(0, 8)}...</Text>
              {user?.createdAt && (
                <Text style={styles.joinedText}>
                  Member since {formatDateForDisplay(user.createdAt)}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* App & Backend Specifications */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Application & Security Architecture</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrapper}>
              <Ionicons name="server-outline" size={16} color={colors.primary} />
            </View>
            <View style={styles.infoTextWrapper}>
              <Text style={styles.infoLabel}>API Endpoint Target</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {API_BASE_URL}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrapper}>
              <Ionicons name="cash-outline" size={16} color={colors.success} />
            </View>
            <View style={styles.infoTextWrapper}>
              <Text style={styles.infoLabel}>Financial Precision Engine</Text>
              <Text style={styles.infoValue}>Integer Paise (Zero Floating-Point Drift)</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrapper}>
              <Ionicons name="time-outline" size={16} color={colors.warning} />
            </View>
            <View style={styles.infoTextWrapper}>
              <Text style={styles.infoLabel}>Business Timezone Standard</Text>
              <Text style={styles.infoValue}>Asia/Kolkata (IST UTC+05:30)</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrapper}>
              <Ionicons name="shield-checkmark-outline" size={16} color={colors.info} />
            </View>
            <View style={styles.infoTextWrapper}>
              <Text style={styles.infoLabel}>Authentication Mechanism</Text>
              <Text style={styles.infoValue}>JWT Access Token + SecureStore Session Rotation</Text>
            </View>
          </View>
        </View>

        {/* Logout CTA */}
        <View style={styles.logoutContainer}>
          <Button
            title="Sign Out of MiniLedger"
            variant="danger"
            size="md"
            onPress={() => setLogoutModalVisible(true)}
            icon={<Ionicons name="log-out-outline" size={16} color={colors.textInverse} />}
          />
        </View>

        <Text style={styles.versionText}>MiniLedger Platform v1.0.0 (Production Verified)</Text>

        {/* Logout Confirmation Modal */}
        <ConfirmationModal
          visible={logoutModalVisible}
          title="Sign Out"
          message="Are you sure you want to sign out? Your session keys will be revoked securely from this device."
          confirmTitle="Yes, Sign Out"
          cancelTitle="Cancel"
          loading={isLoggingOut}
          onConfirm={handleLogout}
          onCancel={() => setLogoutModalVisible(false)}
          variant="danger"
          iconName="log-out-outline"
        />
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  containerDesktop: {
    maxWidth: 640,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    ...shadows.xs,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  phoneText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  idText: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    marginTop: 2,
  },
  joinedText: {
    fontSize: typography.sizes.xxs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorderSubtle,
  },
  infoIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  infoTextWrapper: {
    flex: 1,
  },
  infoLabel: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginTop: 1,
  },
  logoutContainer: {
    marginTop: spacing.sm,
  },
  versionText: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
