import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../src/features/auth/AuthContext';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { colors, radii, spacing, typography, shadows } from '../../src/theme/tokens';
import { Ionicons } from '@expo/vector-icons';

export default function VerifyOtpScreen() {
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  const { verifyOtp, requestOtp } = useAuth();
  const router = useRouter();

  // 60-second cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async () => {
    setError(null);
    const cleaned = otp.trim();

    if (!cleaned || cleaned.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    try {
      setLoading(true);
      await verifyOtp(phoneNumber, cleaned);
    } catch (err: any) {
      setError(err?.message || 'Invalid verification code. Please check server logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      setError(null);
      await requestOtp(phoneNumber);
      setCooldown(60);
    } catch (err: any) {
      setError(err?.message || 'Failed to resend code');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.contentWrapper}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={16} color={colors.textSecondary} />
            <Text style={styles.backText}>Back to Phone</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark" size={24} color={colors.textInverse} />
            </View>
            <Text style={styles.title}>Verify One-Time Passcode</Text>
            <Text style={styles.subtitle}>
              Code sent to <Text style={styles.phoneHighlight}>{phoneNumber}</Text>
            </Text>
          </View>

          <View style={styles.formCard}>
            <Input
              label="6-Digit Verification Code *"
              placeholder="000000"
              value={otp}
              onChangeText={(t) => {
                setOtp(t);
                if (error) setError(null);
              }}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              error={error || undefined}
              style={styles.otpInput}
            />

            <Button
              title="Verify & Enter Ledger"
              size="md"
              loading={loading}
              disabled={loading}
              onPress={handleVerify}
              icon={<Ionicons name="checkmark-done" size={16} color={colors.textInverse} />}
              style={styles.submitButton}
            />

            <View style={styles.resendContainer}>
              {cooldown > 0 ? (
                <Text style={styles.cooldownText}>
                  Resend code in <Text style={styles.timerHighlight}>{cooldown}s</Text>
                </Text>
              ) : (
                <TouchableOpacity onPress={handleResend} style={styles.resendButton}>
                  <Ionicons name="refresh" size={14} color={colors.primary} />
                  <Text style={styles.resendText}>Resend Code</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.devHint}>
              <Ionicons name="terminal-outline" size={15} color={colors.primary} />
              <Text style={styles.devHintText}>
                Dev Mode: Check the running backend terminal to view your generated OTP.
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.base,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconCircle: {
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
  },
  phoneHighlight: {
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    ...shadows.sm,
  },
  otpInput: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    letterSpacing: 6,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  cooldownText: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
  },
  timerHighlight: {
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resendText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  devHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radii.base,
    padding: spacing.sm,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  devHintText: {
    flex: 1,
    fontSize: typography.sizes.xxs,
    color: colors.primaryDark,
    lineHeight: 15,
  },
});
