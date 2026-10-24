import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/features/auth/AuthContext';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { colors, radii, spacing, typography, shadows } from '../../src/theme/tokens';
import { Ionicons } from '@expo/vector-icons';

export default function PhoneScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { requestOtp } = useAuth();
  const router = useRouter();

  const handleRequestOtp = async () => {
    setError(null);
    const cleaned = phoneNumber.trim().replace(/\s+/g, '');

    if (!cleaned) {
      setError('Please enter your phone number');
      return;
    }

    let formattedPhone = cleaned;
    if (/^\d{10}$/.test(cleaned)) {
      formattedPhone = `+91${cleaned}`;
    }

    if (!/^\+[1-9]\d{9,14}$/.test(formattedPhone)) {
      setError('Enter a valid 10-digit mobile number or E.164 format (e.g. +919876543210)');
      return;
    }

    try {
      setLoading(true);
      await requestOtp(formattedPhone);
      router.push({
        pathname: '/(auth)/verify-otp',
        params: { phoneNumber: formattedPhone },
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to request OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Ionicons name="wallet" size={24} color={colors.textInverse} />
            </View>
            <Text style={styles.title}>MiniLedger</Text>
            <Text style={styles.subtitle}>
              Personal money-lending tracker and receivables ledger
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Sign in with Phone</Text>
            <Text style={styles.formDescription}>
              Enter your mobile number to receive a 6-digit one-time passcode.
            </Text>

            <Input
              label="Mobile Number *"
              placeholder="98765 43210"
              value={phoneNumber}
              onChangeText={(t) => {
                setPhoneNumber(t);
                if (error) setError(null);
              }}
              keyboardType="phone-pad"
              autoFocus
              error={error || undefined}
              leftElement={
                <View style={styles.prefixContainer}>
                  <Text style={styles.prefixText}>+91</Text>
                </View>
              }
            />

            <Button
              title="Continue with OTP"
              size="md"
              loading={loading}
              disabled={loading}
              onPress={handleRequestOtp}
              icon={<Ionicons name="arrow-forward" size={16} color={colors.textInverse} />}
              style={styles.submitButton}
            />

            <View style={styles.devNotice}>
              <Ionicons name="information-circle-outline" size={15} color={colors.primary} />
              <Text style={styles.devNoticeText}>
                Dev Mode: OTP is printed directly in the backend terminal log.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 420,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...shadows.xs,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    ...shadows.sm,
  },
  formTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  formDescription: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.base,
  },
  prefixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.sm,
    marginRight: spacing.sm,
    borderRightWidth: 1,
    borderRightColor: colors.surfaceBorder,
  },
  prefixText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  submitButton: {
    marginTop: spacing.xs,
  },
  devNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radii.base,
    padding: spacing.sm,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  devNoticeText: {
    flex: 1,
    fontSize: typography.sizes.xxs,
    color: colors.primaryDark,
    lineHeight: 15,
  },
});
