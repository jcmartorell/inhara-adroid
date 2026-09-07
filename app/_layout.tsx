import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { C } from '../constants/colors';

export default function RootLayout() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session === undefined) return;
    const inAuth = segments[0] === '(auth)';
    if (!session && !inAuth) router.replace('/(auth)');
    else if (session && inAuth) router.replace('/(tabs)');
  }, [session, segments]);

  if (session === undefined) return null;

  const headerStyle = {
    headerStyle: { backgroundColor: C.bg },
    headerTitleStyle: {
      fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
      fontSize: 22,
      color: C.text,
      fontWeight: '400' as const,
    },
    headerTintColor: C.accent,
    headerBackTitle: 'Más',
  };

  return (
    <>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="camino" options={{ title: 'El Camino', ...headerStyle }} />
        <Stack.Screen name="lealtad" options={{ title: 'Beneficios', ...headerStyle }} />
        <Stack.Screen name="avisos" options={{ title: 'Avisos', ...headerStyle }} />
      </Stack>
    </>
  );
}
