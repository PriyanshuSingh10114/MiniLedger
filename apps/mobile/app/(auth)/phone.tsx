import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/features/auth/AuthContext.js';
import { Button } from '../../src/components/Button.js';
import { Input } from '../../src/components/Input.js';
import { colors, radii, spacing, typography } from '../../src/theme/tokens.js';
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

    // Format phone: if 10 digits without code, prepend +91
    let formattedPhone = cleaned;
    if (/^\d{10}$/.test(cleaned)) {
      formattedPhone = `+91${cleaned}`;
    }

    if (!/^\+[1-9]\d{9,14}$/.test(formattedPhone)) {
      setError('Enter a valid 10-digit mobile number or full E.164 format (e.g. +919876543210)');
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
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Ionicons name="wallet" size={36} color={colors.primary} />
          </View>
          <Text style={styles.title}>MiniLedger</Text>
          <Text style={styles.subtitle}>
            Personal money-lending tracker. Keep reliable records of loans and repayments.
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Sign in with Phone</Text>
          <Text style={styles.formDescription}>
            We will send a 6-digit verification code to your mobile number.
          </Text>

          <Input
            label="Phone Number"
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
                <Text style={styles.flag}>🇮🇳</Text>
                <Text style={styles.prefixText}>+91</Text>
              </View>
            }
          />

          <Button
            title="Get Verification Code"
            size="lg"
            loading={loading}
            onPress={handleRequestOtp}
            style={styles.submitButton}
          />

          <View style={styles.devNotice}>
            <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.devNoticeText}>
              In development mode, your 6-digit OTP is printed to the backend terminal log.
            </Text>
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
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: radii.xl,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.extrabold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  formTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  formDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  prefixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.sm,
    marginRight: spacing.sm,
    borderRightWidth: 1,
    borderRightColor: colors.surfaceBorder,
    gap: spacing.xs,
  },
  flag: {
    fontSize: 18,
  },
  prefixText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  devNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.base,
    padding: spacing.md,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  devNoticeText: {
    flex: 1,
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});
