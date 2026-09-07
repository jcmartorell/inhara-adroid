import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { NIVELES, getNivel, getProgresoPct } from '../lib/camino';

export default function CaminoScreen() {
  const [totalClases, setTotalClases] = useState(0);
  const [esteMes, setEsteMes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandido, setExpandido] = useState<number | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data: asist } = await supabase
      .from('asistencias')
      .select('id, fecha')
      .eq('user_id', session.user.id)
      .order('fecha');

    setTotalClases(asist?.length ?? 0);
    const mesActual = new Date().toISOString().slice(0, 7);
    setEsteMes(asist?.filter((a: any) => a.fecha?.startsWith(mesActual)).length ?? 0);
    setLoading(false);
  }

  const nivel = getNivel(totalClases);
  const pct = getProgresoPct(totalClases);
  const siguiente = NIVELES.find((n) => n.num === nivel.num + 1);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={C.accent} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Hero nivel actual */}
      <View style={styles.hero}>
        <Text style={styles.heroBadge}>NIVEL {nivel.num} DE 9 · {nivel.patanjali.toUpperCase()}</Text>
        <Text style={styles.heroNombre}>{nivel.nombre}</Text>
        <Text style={styles.heroDesc}>{nivel.descripcion}</Text>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>
        <View style={styles.heroFooter}>
          <Text style={styles.heroFooterText}>{totalClases} clases</Text>
          {siguiente && (
            <Text style={styles.heroFooterText}>
              {siguiente.rangoMin - totalClases} para {siguiente.nombre}
            </Text>
          )}
        </View>
        <Text style={styles.heroEnsenanza}>&ldquo;{nivel.ensenanza}&rdquo;</Text>
      </View>

      {/* Stats personales */}
      <View style={styles.row}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>ESTE MES</Text>
          <Text style={styles.statValue}>{esteMes}</Text>
          <Text style={styles.statSub}>clases</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>TOTAL</Text>
          <Text style={styles.statValue}>{totalClases}</Text>
          <Text style={styles.statSub}>clases acumuladas</Text>
        </View>
      </View>

      {/* Lista de todos los niveles */}
      <View style={styles.listaCard}>
        <Text style={styles.listaTitulo}>El camino completo</Text>
        {NIVELES.map((n, idx) => {
          const completado = totalClases > n.rangoMax;
          const actual = n.num === nivel.num;
          const bloqueado = totalClases < n.rangoMin;
          const isExpanded = expandido === n.num;

          return (
            <View key={n.num}>
              <TouchableOpacity
                style={[styles.nivelRow, actual && styles.nivelRowActual]}
                onPress={() => setExpandido(isExpanded ? null : n.num)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.circle,
                  completado && styles.circleCompletado,
                  actual && styles.circleActual,
                  bloqueado && styles.circleBloqueado,
                ]}>
                  <Text style={[styles.circleText, (completado || actual) && styles.circleTextLight]}>
                    {completado ? '✓' : String(n.num)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.nivelNombre, bloqueado && styles.textMuted]}>{n.nombre}</Text>
                  <Text style={[styles.nivelRango, bloqueado && styles.textMuted]}>
                    {n.rangoMin}–{n.rangoMax === 9999 ? '∞' : n.rangoMax} clases · {n.frecuencia}
                  </Text>
                </View>
                <Text style={styles.chevron}>{isExpanded ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.expandido}>
                  <Text style={styles.expandidoPatanjali}>{n.patanjali}</Text>
                  <Text style={styles.expandidoDesc}>{n.descripcion}</Text>
                  <Text style={styles.expandidoEnsenanza}>&ldquo;{n.ensenanza}&rdquo;</Text>
                </View>
              )}
              {idx < NIVELES.length - 1 && <View style={styles.divider} />}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, gap: 14, paddingBottom: 32 },
  loadingContainer: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },

  hero: { backgroundColor: C.brown, borderRadius: 16, padding: 24, gap: 8 },
  heroBadge: { fontSize: 9, fontWeight: '600', color: C.gold + '66', letterSpacing: 1 },
  heroNombre: {
    fontSize: 34,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '300',
    color: C.gold,
  },
  heroDesc: { fontSize: 13, color: C.gold + 'BB', lineHeight: 20 },
  progressBg: { height: 5, backgroundColor: C.gold + '33', borderRadius: 3, marginVertical: 2 },
  progressFill: { height: 5, backgroundColor: C.gold, borderRadius: 3 },
  heroFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  heroFooterText: { fontSize: 11, color: C.gold + '66' },
  heroEnsenanza: { fontSize: 12, fontStyle: 'italic', color: C.gold + '99' },

  row: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 16,
    gap: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statLabel: { fontSize: 9, fontWeight: '600', color: C.textMuted, letterSpacing: 0.5 },
  statValue: {
    fontSize: 30,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '300',
    color: C.text,
  },
  statSub: { fontSize: 11, color: C.textSoft },

  listaCard: { backgroundColor: C.white, borderRadius: 14, overflow: 'hidden' },
  listaTitulo: {
    fontSize: 20,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: C.text,
    padding: 20,
    paddingBottom: 12,
  },

  nivelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
  },
  nivelRowActual: { backgroundColor: '#F5EDE0' },

  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8E0D5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleCompletado: { backgroundColor: C.accent },
  circleActual: { backgroundColor: C.gold },
  circleBloqueado: { backgroundColor: '#EDE8E2' },
  circleText: { fontSize: 12, fontWeight: '600', color: C.textSoft },
  circleTextLight: { color: '#fff' },

  nivelNombre: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: C.text,
  },
  nivelRango: { fontSize: 11, color: C.textSoft, marginTop: 1 },
  textMuted: { opacity: 0.45 },
  chevron: { fontSize: 10, color: C.textSoft },

  expandido: { paddingHorizontal: 62, paddingBottom: 14, gap: 6 },
  expandidoPatanjali: { fontSize: 11, fontWeight: '600', color: C.accent, letterSpacing: 0.5 },
  expandidoDesc: { fontSize: 13, color: C.textSoft, lineHeight: 18 },
  expandidoEnsenanza: { fontSize: 12, fontStyle: 'italic', color: C.textMuted },

  divider: { height: 1, backgroundColor: C.border, marginLeft: 62 },
});
