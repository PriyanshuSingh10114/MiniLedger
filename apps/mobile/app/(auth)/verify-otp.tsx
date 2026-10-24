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
import { colors, radii, spacing, typography } from '../../src/theme/tokens';
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
      // Success will automatically trigger route navigation via AuthContext & root layout
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
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark" size={36} color={colors.primary} />
          </View>
          <Text style={styles.title}>Verify Code</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to <Text style={styles.phoneHighlight}>{phoneNumber}</Text>
          </Text>
        </View>

        <View style={styles.formCard}>
          <Input
            label="6-Digit Verification Code"
            placeholder="123456"
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
            title="Verify & Continue"
            size="lg"
            loading={loading}
            onPress={handleVerify}
            style={styles.submitButton}
          />

          <View style={styles.resendContainer}>
            {cooldown > 0 ? (
              <Text style={styles.cooldownText}>
                Resend code in <Text style={styles.timerHighlight}>{cooldown}s</Text>
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend} style={styles.resendButton}>
                <Ionicons name="refresh" size={16} color={colors.primary} />
                <Text style={styles.resendText}>Resend Verification Code</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.devHint}>
            <Ionicons name="terminal-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.devHintText}>
              Development tip: Check the running backend terminal to view the generated OTP log.
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: radii.xl,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    lineHeight: 20,
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
  },
  otpInput: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    letterSpacing: 8,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: spacing.md,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  cooldownText: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  timerHighlight: {
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  resendText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  devHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.base,
    padding: spacing.md,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  devHintText: {
    flex: 1,
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});
