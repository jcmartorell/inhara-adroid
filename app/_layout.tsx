import { useEffect, useRef, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { supabase } from '../lib/supabase';
import { cargarPerfilBasico, esMaestra } from '../lib/rol';
import type { Session } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import {
  useFonts,
  MavenPro_400Regular,
  MavenPro_500Medium,
  MavenPro_600SemiBold,
  MavenPro_700Bold,
} from '@expo-google-fonts/maven-pro';
import { C } from '../constants/colors';
import { F } from '../constants/fonts';

// A dónde lleva tocar una notificación push según lo que trae el payload.
function destinoNotificacion(data: Record<string, any> | undefined) {
  if (data?.tipo === 'mensaje') return '/mensajes';
  if (data?.tipo === 'evento' && data?.eventoId) return `/evento/${data.eventoId}`;
  if (data?.tipo === 'lista_espera') return '/(tabs)/clases';
  return '/avisos';
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    MavenPro_400Regular,
    MavenPro_500Medium,
    MavenPro_600SemiBold,
    MavenPro_700Bold,
  });
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  // undefined = cargando el rol; null = sin rol (alumna)
  const [rol, setRol] = useState<string | null | undefined>(undefined);
  const router = useRouter();
  const segments = useSegments();
  const coldStartChecked = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id;
  useEffect(() => {
    if (session === undefined) return;
    if (!userId) { setRol(null); return; }
    setRol(undefined);
    cargarPerfilBasico(userId).then((p) => setRol(p.rol)).catch(() => setRol(null));
  }, [userId, session === undefined]);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    // Tap en la notificación push con la app ya abierta (foreground o background)
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      router.push(destinoNotificacion(response.notification.request.content.data as any) as any);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (session === undefined) return;
    if (session && rol === undefined) return; // espera a saber si es maestra o alumna
    const inAuth = segments[0] === '(auth)';
    const enMaestra = (segments[0] as string) === '(maestra)';
    const maestra = esMaestra(rol);
    if (!session && !inAuth) { router.replace('/(auth)'); return; }
    if (session && inAuth) { router.replace((maestra ? '/(maestra)' : '/(tabs)') as any); return; }
    if (session && maestra && !enMaestra) { router.replace('/(maestra)' as any); return; }
    if (session && !maestra && enMaestra) { router.replace('/(tabs)'); return; }

    if (session && !coldStartChecked.current) {
      coldStartChecked.current = true;
      if (Platform.OS === 'web') return;
      // App abierta desde cero tocando la notificación — no dispara el listener de arriba
      Notifications.getLastNotificationResponseAsync().then((response) => {
        if (!response) return;
        router.push(destinoNotificacion(response.notification.request.content.data as any) as any);
      });
    }
  }, [session, segments, rol]);

  // Espera a la sesión y a la fuente; si la fuente fallara, la app abre igual con la del sistema.
  if (session === undefined || (session && rol === undefined) || (!fontsLoaded && !fontError)) return null;

  const headerStyle = {
    headerStyle: { backgroundColor: C.bg },
    headerTitleStyle: {
      fontFamily: F.regular,
      fontSize: 22,
      color: C.text,
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
        <Stack.Screen name="(maestra)" options={{ headerShown: false }} />
        <Stack.Screen name="camino" options={{ title: 'El Camino', ...headerStyle }} />
        <Stack.Screen name="lealtad" options={{ title: 'Beneficios', ...headerStyle }} />
        <Stack.Screen name="avisos" options={{ title: 'Avisos', ...headerStyle }} />
        <Stack.Screen name="mensajes" options={{ title: 'Mensajes', ...headerStyle }} />
        <Stack.Screen name="evento/[id]" options={{ title: 'Evento', ...headerStyle }} />
      </Stack>
    </>
  );
}
