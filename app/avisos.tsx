import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import type { Aviso } from '../lib/models';

function tipoColor(tipo: string | null): string {
  switch (tipo) {
    case 'urgente': return '#D94040';
    case 'info': return C.accent;
    case 'promo': return '#2A6B40';
    default: return C.textSoft;
  }
}

function tipoLabel(tipo: string | null): string {
  switch (tipo) {
    case 'urgente': return 'URGENTE';
    case 'info': return 'INFO';
    case 'promo': return 'PROMO';
    default: return 'AVISO';
  }
}

function formatFecha(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${d.getFullYear()}`;
}

export default function AvisosScreen() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase
      .from('avisos')
      .select('*')
      .eq('activo', true)
      .order('created_at', { ascending: false });

    setAvisos(data ?? []);
    setLoading(false);

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.from('notificaciones').update({ leida: true })
        .eq('user_id', session.user.id).eq('leida', false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={C.accent} size="large" />
      </View>
    );
  }

  if (!avisos.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🔔</Text>
        <Text style={styles.emptyText}>Sin avisos por ahora</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {avisos.map((aviso) => (
        <View key={aviso.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.tipoBadge, { backgroundColor: tipoColor(aviso.tipo) + '22' }]}>
              <Text style={[styles.tipoText, { color: tipoColor(aviso.tipo) }]}>
                {tipoLabel(aviso.tipo)}
              </Text>
            </View>
            <Text style={styles.fecha}>{formatFecha(aviso.created_at)}</Text>
          </View>
          <Text style={styles.titulo}>{aviso.titulo}</Text>
          <Text style={styles.mensaje}>{aviso.mensaje}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  loadingContainer: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 15, color: C.textSoft },

  card: {
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 18,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tipoBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tipoText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  fecha: { fontSize: 11, color: C.textMuted },
  titulo: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: C.text,
    lineHeight: 22,
  },
  mensaje: { fontSize: 13, color: C.textSoft, lineHeight: 19 },
});
