import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { queryClient } from '../src/lib/queryClient.js';
import { AuthProvider, useAuth } from '../src/features/auth/AuthContext.js';
import { colors } from '../src/theme/tokens.js';

function RootNavigationLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to phone login
      router.replace('/(auth)/phone');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to main tabs
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="loans/new"
          options={{
            headerShown: true,
            title: 'Add New Loan',
            headerTintColor: colors.textPrimary,
            headerStyle: { backgroundColor: colors.surface },
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="loans/[id]"
          options={{
            headerShown: true,
            title: 'Loan Details',
            headerTintColor: colors.textPrimary,
            headerStyle: { backgroundColor: colors.surface },
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: true,
            title: 'Settings & Profile',
            headerTintColor: colors.textPrimary,
            headerStyle: { backgroundColor: colors.surface },
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RootNavigationLayout />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
