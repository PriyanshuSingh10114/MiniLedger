import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCreateLoan } from '../../src/features/loans/useCreateLoan';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { colors, radii, spacing, typography } from '../../src/theme/tokens';
import { rupeesToPaise, formatPaiseToINR, getTodayDateString } from '@miniledger/shared';
import { Ionicons } from '@expo/vector-icons';

export default function NewLoanScreen() {
  const router = useRouter();
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
      errs.dueDate = 'Due date must be in YYYY-MM-DD format';
    } else if (isNaN(new Date(dueDate).getTime())) {
      errs.dueDate = 'Invalid calendar date';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

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
        <View style={styles.formCard}>
          <Text style={styles.sectionHeader}>Loan Details</Text>

          {/* Friend Name */}
          <Input
            label="Who are you lending to? *"
            placeholder="e.g. Rahul Sharma"
            value={friendName}
            onChangeText={(t) => {
              setFriendName(t);
              if (errors.friendName) setErrors((prev) => ({ ...prev, friendName: '' }));
            }}
            error={errors.friendName}
            leftElement={
              <Ionicons
                name="person-outline"
                size={20}
                color={colors.textMuted}
                style={styles.inputIcon}
              />
            }
          />

          {/* Amount in Rupees */}
          <Input
            label="Loan Amount (₹) *"
            placeholder="e.g. 2500.00"
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
            label="Repayment Due Date (YYYY-MM-DD) *"
            placeholder="2026-11-20"
            value={dueDate}
            onChangeText={(t) => {
              setDueDate(t);
              if (errors.dueDate) setErrors((prev) => ({ ...prev, dueDate: '' }));
            }}
            error={errors.dueDate}
            leftElement={
              <Ionicons
                name="calendar-outline"
                size={20}
                color={colors.textMuted}
                style={styles.inputIcon}
              />
            }
            hint="Loans not repaid by this date will be flagged as Overdue."
          />

          {/* Optional Note */}
          <Input
            label="Note or Reason (Optional)"
            placeholder="e.g. Dinner split, travel expense, college fee"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
            maxLength={500}
            leftElement={
              <Ionicons
                name="document-text-outline"
                size={20}
                color={colors.textMuted}
                style={styles.inputIcon}
              />
            }
          />

          <Button
            title="Create Loan Record"
            size="lg"
            loading={createLoanMutation.isPending}
            onPress={handleSubmit}
            style={styles.submitButton}
            icon={<Ionicons name="checkmark" size={20} color={colors.textInverse} />}
          />
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
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  sectionHeader: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.base,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  currencyPrefix: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  submitButton: {
    marginTop: spacing.base,
  },
});
