import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { C } from '../../constants/colors';
import { F } from '../../constants/fonts';
import { supabase } from '../../lib/supabase';

const SECCIONES = [
  { emoji: '🧘', titulo: 'El Camino', subtitulo: '9 niveles de práctica', ruta: '/camino' },
  { emoji: '🤍', titulo: 'Beneficios', subtitulo: 'The Inhara Community Circle', ruta: '/lealtad' },
  { emoji: '🔔', titulo: 'Avisos', subtitulo: 'Noticias y comunicados de Inhara', ruta: '/avisos' },
  { emoji: '✉️', titulo: 'Mensajes', subtitulo: 'Encuestas y preguntas de Inhara', ruta: '/mensajes' },
];

export default function MasScreen() {
  const router = useRouter();
  const [eliminando, setEliminando] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  function handleDeleteAccount() {
    Alert.alert(
      'Eliminar cuenta',
      'Esta acción borrará tu perfil y toda tu información de Inhara de forma permanente. No se puede deshacer. ¿Deseas continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar cuenta', style: 'destructive', onPress: confirmDeleteAccount },
      ]
    );
  }

  async function confirmDeleteAccount() {
    try {
      setEliminando(true);
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) throw new Error('No se encontró la sesión activa.');

      // Borra el perfil y datos asociados visibles en la app.
      await supabase.from('profiles').delete().eq('id', userId);

      // Invalida el acceso: se reemplaza la contraseña por una aleatoria
      // desconocida antes de cerrar la sesión, para que no se pueda volver a entrar.
      const claveAleatoria = Math.random().toString(36).slice(2) + Date.now().toString(36);
      await supabase.auth.updateUser({ password: claveAleatoria });

      await supabase.auth.signOut();

      Alert.alert('Cuenta eliminada', 'Tu cuenta y tus datos han sido eliminados.');
    } catch (e: any) {
      Alert.alert('No se pudo eliminar la cuenta', e?.message ?? 'Intenta de nuevo más tarde.');
    } finally {
      setEliminando(false);
    }
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.titulo}>Mi Inhara</Text>

      <View style={styles.lista}>
        {SECCIONES.map((s, i) => (
          <TouchableOpacity
            key={s.ruta}
            style={[styles.fila, i < SECCIONES.length - 1 && styles.filaDivider]}
            onPress={() => router.push(s.ruta as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>{s.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.filaTitulo}>{s.titulo}</Text>
              <Text style={styles.filaSubtitulo}>{s.subtitulo}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.salirBtn} onPress={handleSignOut} activeOpacity={0.7}>
        <Text style={styles.salirText}>Cerrar sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.salirBtn}
        onPress={handleDeleteAccount}
        activeOpacity={0.7}
        disabled={eliminando}
      >
        <Text style={styles.eliminarText}>{eliminando ? 'Eliminando…' : 'Eliminar cuenta'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingBottom: 40 },

  titulo: {
    fontSize: 28,
    fontFamily: F.regular,
    color: C.text,
    marginBottom: 20,
  },

  lista: {
    backgroundColor: C.white, borderRadius: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  fila: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 16, gap: 14,
  },
  filaDivider: { borderBottomWidth: 1, borderBottomColor: C.border },
  emoji: { fontSize: 24, width: 34, textAlign: 'center' },
  filaTitulo: {
    fontSize: 16, color: C.text,
    fontFamily: F.regular,
  },
  filaSubtitulo: { fontSize: 12, color: C.textSoft, marginTop: 1 },
  chevron: { fontSize: 22, color: C.textMuted, fontWeight: '300' },

  salirBtn: { marginTop: 32, alignItems: 'center', paddingVertical: 10 },
  salirText: { fontSize: 14, color: C.textMuted },
  eliminarText: { fontSize: 14, color: '#b3261e' },
});
