import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../src/theme/tokens.js';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="phone" />
      <Stack.Screen name="verify-otp" />
    </Stack>
  );
}
