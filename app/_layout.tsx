import { useEffect, useRef, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { C } from '../constants/colors';

function pantallaParaTipo(tipo: string | undefined) {
  return tipo === 'mensaje' ? '/mensajes' : '/avisos';
}

export default function RootLayout() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const router = useRouter();
  const segments = useSegments();
  const coldStartChecked = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Tap en la notificación push con la app ya abierta (foreground o background)
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const tipo = response.notification.request.content.data?.tipo as string | undefined;
      router.push(pantallaParaTipo(tipo) as any);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (session === undefined) return;
    const inAuth = segments[0] === '(auth)';
    if (!session && !inAuth) { router.replace('/(auth)'); return; }
    if (session && inAuth) router.replace('/(tabs)');

    if (session && !coldStartChecked.current) {
      coldStartChecked.current = true;
      // App abierta desde cero tocando la notificación — no dispara el listener de arriba
      Notifications.getLastNotificationResponseAsync().then((response) => {
        if (!response) return;
        const tipo = response.notification.request.content.data?.tipo as string | undefined;
        router.push(pantallaParaTipo(tipo) as any);
      });
    }
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
        <Stack.Screen name="mensajes" options={{ title: 'Mensajes', ...headerStyle }} />
      </Stack>
    </>
  );
}
