import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCreateLoan } from '../../src/features/loans/useCreateLoan';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { colors, radii, spacing, typography, shadows } from '../../src/theme/tokens';
import { rupeesToPaise, formatPaiseToINR } from '@miniledger/shared';
import { Ionicons } from '@expo/vector-icons';

export default function NewLoanScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const createLoanMutation = useCreateLoan();

  const [friendName, setFriendName] = useState('');
  const [amountRupees, setAmountRupees] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    // Default to 14 days from today
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [note, setNote] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Live paise calculation preview
  let previewPaise: number | null = null;
  try {
    if (amountRupees.trim()) {
      previewPaise = rupeesToPaise(amountRupees);
    }
  } catch {
    previewPaise = null;
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!friendName.trim()) {
      errs.friendName = "Friend's name is required";
    }

    if (!amountRupees.trim()) {
      errs.amount = 'Loan amount is required';
    } else {
      try {
        rupeesToPaise(amountRupees);
      } catch (err: any) {
        errs.amount = err?.message || 'Invalid amount. Minimum is ₹1 with up to 2 decimal places.';
      }
    }

    if (!dueDate.trim()) {
      errs.dueDate = 'Due date is required';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate.trim())) {
      errs.dueDate = 'Due date must be in YYYY-MM-DD format (e.g. 2026-11-20)';
    } else if (isNaN(new Date(dueDate).getTime())) {
      errs.dueDate = 'Invalid calendar date';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || createLoanMutation.isPending) return;

    try {
      await createLoanMutation.mutateAsync({
        friendName: friendName.trim(),
        amount: amountRupees.trim(),
        dueDate: dueDate.trim(),
        note: note.trim() || undefined,
      });

      router.back();
    } catch (err: any) {
      Alert.alert('Error Creating Loan', err?.message || 'Failed to record loan');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={[styles.formCardWrapper, isDesktop && styles.formCardWrapperDesktop]}>
          {/* Breadcrumb / Back button */}
          <View style={styles.topBackRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={16} color={colors.textSecondary} />
              <Text style={styles.backText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formCard}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <Ionicons name="add-circle" size={22} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.title}>Record New Loan</Text>
                <Text style={styles.subtitle}>
                  Enter the borrowing friend and repayment terms.
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Friend Name */}
            <Input
              label="Recipient / Friend's Name *"
              placeholder="e.g. Rohan Mehra"
              value={friendName}
              onChangeText={(t) => {
                setFriendName(t);
                if (errors.friendName) setErrors((prev) => ({ ...prev, friendName: '' }));
              }}
              error={errors.friendName}
              leftElement={
                <Ionicons
                  name="person-outline"
                  size={16}
                  color={colors.textMuted}
                  style={styles.inputIcon}
                />
              }
            />

            {/* Amount in Rupees */}
            <Input
              label="Principal Amount (₹) *"
              placeholder="e.g. 5000.00"
              value={amountRupees}
              onChangeText={(t) => {
                setAmountRupees(t);
                if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }));
              }}
              keyboardType="decimal-pad"
              error={errors.amount}
              leftElement={<Text style={styles.currencyPrefix}>₹</Text>}
              hint={
                previewPaise !== null
                  ? `Stored as ${previewPaise} integer paise (${formatPaiseToINR(previewPaise)})`
                  : 'Minimum ₹1.00, maximum 2 decimal places'
              }
            />

            {/* Due Date */}
            <Input
              label="Agreed Repayment Due Date (YYYY-MM-DD) *"
              placeholder="YYYY-MM-DD"
              value={dueDate}
              onChangeText={(t) => {
                setDueDate(t);
                if (errors.dueDate) setErrors((prev) => ({ ...prev, dueDate: '' }));
              }}
              error={errors.dueDate}
              leftElement={
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={colors.textMuted}
                  style={styles.inputIcon}
                />
              }
              hint="Loans past this date will automatically be flagged as Overdue in your ledger."
            />

            {/* Optional Note */}
            <Input
              label="Purpose / Memo (Optional)"
              placeholder="e.g. Flight booking advance, restaurant bill split"
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              maxLength={500}
              style={styles.textArea}
              containerStyle={styles.noteContainer}
              leftElement={
                <Ionicons
                  name="document-text-outline"
                  size={16}
                  color={colors.textMuted}
                  style={styles.inputIcon}
                />
              }
            />

            {/* Action Row */}
            <View style={styles.actionRow}>
              <Button
                title="Cancel"
                variant="outline"
                size="md"
                onPress={() => router.back()}
                style={styles.cancelBtn}
              />
              <Button
                title="Save Loan Record"
                variant="primary"
                size="md"
                loading={createLoanMutation.isPending}
                disabled={createLoanMutation.isPending}
                onPress={handleSubmit}
                icon={<Ionicons name="checkmark" size={16} color={colors.textInverse} />}
                style={styles.submitBtn}
              />
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
    padding: spacing.base,
    paddingBottom: spacing['4xl'],
    alignItems: 'center',
  },
  formCardWrapper: {
    width: '100%',
    maxWidth: 580,
  },
  formCardWrapperDesktop: {
    marginTop: spacing.xl,
  },
  topBackRow: {
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  backText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: spacing.lg,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  currencyPrefix: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginRight: spacing.xs,
  },
  noteContainer: {
    marginBottom: spacing.lg,
  },
  textArea: {
    height: 72,
    textAlignVertical: 'top',
    paddingTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  cancelBtn: {
    minWidth: 90,
  },
  submitBtn: {
    minWidth: 160,
  },
});
