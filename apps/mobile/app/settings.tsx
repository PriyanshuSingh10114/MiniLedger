import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '../src/features/auth/AuthContext.js';
import { Button } from '../src/components/Button.js';
import { ConfirmationModal } from '../src/components/ConfirmationModal.js';
import { colors, radii, spacing, typography, shadows } from '../src/theme/tokens.js';
import { API_BASE_URL } from '../src/lib/api.js';
import { formatDateForDisplay } from '@miniledger/shared';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Profile Card */}
      <View style={styles.card}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color={colors.primary} />
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
        <Text style={styles.cardTitle}>Application & Security Info</Text>

        <View style={styles.infoRow}>
          <View style={styles.infoIconWrapper}>
            <Ionicons name="server-outline" size={18} color={colors.primary} />
          </View>
          <View style={styles.infoTextWrapper}>
            <Text style={styles.infoLabel}>Backend API Endpoint</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {API_BASE_URL}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconWrapper}>
            <Ionicons name="cash-outline" size={18} color={colors.success} />
          </View>
          <View style={styles.infoTextWrapper}>
            <Text style={styles.infoLabel}>Financial Precision Engine</Text>
            <Text style={styles.infoValue}>Integer Paise (Zero Floating-Point Drift)</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconWrapper}>
            <Ionicons name="time-outline" size={18} color={colors.warning} />
          </View>
          <View style={styles.infoTextWrapper}>
            <Text style={styles.infoLabel}>Business Timezone Standard</Text>
            <Text style={styles.infoValue}>Asia/Kolkata (IST UTC+05:30)</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconWrapper}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.info} />
          </View>
          <View style={styles.infoTextWrapper}>
            <Text style={styles.infoLabel}>Session Security</Text>
            <Text style={styles.infoValue}>JWT Access Token + SecureStore Rotation</Text>
          </View>
        </View>
      </View>

      {/* Logout CTA */}
      <View style={styles.logoutContainer}>
        <Button
          title="Sign Out of MiniLedger"
          variant="danger"
          size="lg"
          onPress={() => setLogoutModalVisible(true)}
          icon={<Ionicons name="log-out-outline" size={20} color={colors.textInverse} />}
        />
      </View>

      <Text style={styles.versionText}>MiniLedger Mobile v1.0.0 (Production Build Ready)</Text>

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
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    ...shadows.sm,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.base,
  },
  profileInfo: {
    flex: 1,
  },
  phoneText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  idText: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  joinedText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 4,
  },
  cardTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.base,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  infoIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  infoTextWrapper: {
    flex: 1,
  },
  infoLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginTop: 1,
  },
  logoutContainer: {
    marginTop: spacing.md,
  },
  versionText: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
