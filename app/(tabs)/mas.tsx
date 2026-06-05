import { View, Text, ScrollView, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '../../constants/colors';
import { supabase } from '../../lib/supabase';

const SECCIONES = [
  { emoji: '🧘', titulo: 'El Camino', subtitulo: '9 niveles de práctica', ruta: '/camino' },
  { emoji: '🤍', titulo: 'Lealtad', subtitulo: 'Mat to Heart — beneficios y colaboraciones', ruta: '/lealtad' },
  { emoji: '🔔', titulo: 'Avisos', subtitulo: 'Noticias y comunicados de Inhara', ruta: '/avisos' },
];

export default function MasScreen() {
  const router = useRouter();

  async function handleSignOut() {
    await supabase.auth.signOut();
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingBottom: 40 },

  titulo: {
    fontSize: 28,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '300',
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
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  filaSubtitulo: { fontSize: 12, color: C.textSoft, marginTop: 1 },
  chevron: { fontSize: 22, color: C.textMuted, fontWeight: '300' },

  salirBtn: { marginTop: 32, alignItems: 'center', paddingVertical: 10 },
  salirText: { fontSize: 14, color: C.textMuted },
});
