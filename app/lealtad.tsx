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
import { PREMIUM_SLUGS } from '../lib/camino';

const COLABS = [
  {
    emoji: '🌿',
    nombre: 'Quindé',
    categoria: 'Bienestar & Belleza',
    beneficios: [
      'Diagnóstico facial gratuito — primera visita',
      'Presoterapia extra al acudir a facial — 1x/mes',
      '15% desc. masaje o drenaje linfático — primera visita',
    ],
  },
  {
    emoji: '💪',
    nombre: 'MP Fisioterapia',
    categoria: 'Salud & Recuperación',
    beneficios: [
      'Trimestral: 10% primera consulta',
      'Semestral: 15% en 3 sesiones',
      'Anual: 15% en sesiones + 1 presoterapia gratis',
    ],
  },
  {
    emoji: '🧠',
    nombre: 'Espacio Psicológico',
    categoria: 'Salud Mental',
    beneficios: ['50% de descuento en la primera sesión'],
  },
];

function riesgoEstado(dias: number): { label: string; color: string } {
  if (dias < 7) return { label: 'En práctica', color: '#2A6B40' };
  if (dias < 14) return { label: 'Retomando', color: C.accent };
  if (dias < 21) return { label: 'Renovando', color: C.accent };
  return { label: 'Nuevo comienzo', color: C.accent };
}

export default function LealtadScreen() {
  const [totalClases, setTotalClases] = useState(0);
  const [mesesEnInhara, setMesesEnInhara] = useState(0);
  const [mesesConsecutivos, setMesesConsecutivos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [diasSinAsistir, setDiasSinAsistir] = useState(999);
  const [planSlug, setPlanSlug] = useState('');
  const [planNombre, setPlanNombre] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const userId = session.user.id;

    const [{ data: asist }, { data: sus }, { data: prof }] = await Promise.all([
      supabase.from('asistencias').select('id, fecha').eq('user_id', userId).order('fecha'),
      supabase.from('suscripciones').select('*').eq('user_id', userId).order('created_at'),
      supabase.from('profiles').select('created_at').eq('id', userId).limit(1),
    ]);

    setTotalClases(asist?.length ?? 0);

    if (asist?.length) {
      const ultima = asist[asist.length - 1];
      if (ultima.fecha) {
        const d = new Date(ultima.fecha + 'T00:00:00');
        const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
        setDiasSinAsistir(diff);
      }
    }

    const susAll = sus ?? [];
    const consecutivos = susAll.filter((s: any) => ['activo', 'vencido'].includes(s.estado)).length;
    setMesesConsecutivos(consecutivos);

    const activa = susAll.find((s: any) => s.estado === 'activo');
    if (activa?.plan_id) {
      const { data: planes } = await supabase.from('planes').select('nombre, slug').eq('id', activa.plan_id).limit(1);
      setPlanSlug(planes?.[0]?.slug ?? '');
      setPlanNombre(planes?.[0]?.nombre ?? '');
    }

    if (prof?.[0]?.created_at) {
      const d = new Date(prof[0].created_at);
      const meses = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
      setMesesEnInhara(Math.floor(meses));
    }

    // Racha semanal
    let rachaActual = 0;
    const asistFechas = (asist ?? []).map((a: any) => new Date(a.fecha + 'T00:00:00').getTime());
    for (let i = 0; i < 12; i++) {
      const semFin = Date.now() - i * 7 * 86400000;
      const semIni = semFin - 7 * 86400000;
      if (asistFechas.some((t) => t >= semIni && t < semFin)) {
        rachaActual++;
      } else {
        break;
      }
    }
    setRacha(rachaActual);
    setLoading(false);
  }

  const esPremium = PREMIUM_SLUGS.includes(planSlug);
  const riesgo = riesgoEstado(diasSinAsistir);

  const upgradeMsg =
    (['8clases', 'paquete-8'].includes(planSlug) && mesesConsecutivos >= 3)
      ? 'Upgrade disponible a 10 clases'
      : (['10clases', 'paquete-10'].includes(planSlug) && mesesConsecutivos >= 3)
      ? 'Upgrade disponible a 12 clases'
      : null;

  const beneficios = [
    { texto: '1 invitado gratis/mes', activo: true, nota: 'Para cualquier clase — siempre su primera visita' },
    { texto: '10% desc. talleres', activo: esPremium, nota: 'En todos los talleres de Inhara' },
    { texto: '10% desc. merch', activo: esPremium, nota: 'En productos de la tienda' },
    { texto: 'Acceso a colaboraciones', activo: esPremium, nota: 'Quindé, MP Fisio, Espacio Psicológico' },
    { texto: '10% desc. retiro anual', activo: esPremium && mesesConsecutivos >= 6, nota: 'Requiere 6 meses consecutivos' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={C.accent} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitulo}>Beneficios</Text>
        <Text style={styles.headerSubtitulo}>The Inhara Community Circle</Text>
      </View>

      {upgradeMsg && (
        <View style={styles.upgradeBanner}>
          <Text style={styles.upgradeBannerText}>🎁 {upgradeMsg}</Text>
        </View>
      )}

      {/* Stats grid */}
      <View style={styles.grid}>
        <StatCard label="Tiempo en Inhara" value={String(mesesEnInhara)} sub={mesesEnInhara === 1 ? 'mes' : 'meses'} />
        <StatCard label="Paquetes seguidos" value={String(mesesConsecutivos)} sub="consecutivos" />
        <StatCard label="Racha máxima" value={String(racha)} sub="semanas seguidas" />
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>ESTADO</Text>
          <Text style={[styles.statValue, { color: riesgo.color }]}>{riesgo.label}</Text>
          <Text style={styles.statSub}>
            {diasSinAsistir < 999 ? `${diasSinAsistir} días sin clase` : 'Sin historial'}
          </Text>
        </View>
      </View>

      {/* Beneficios */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{planNombre || 'Sin plan activo'}</Text>
        {beneficios.map((b, i) => (
          <View key={i} style={styles.beneficioRow}>
            <Text style={[styles.beneficioCheck, b.activo && styles.beneficioCheckActive]}>
              {b.activo ? '●' : '○'}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.beneficioTexto, !b.activo && styles.textMuted]}>{b.texto}</Text>
              <Text style={styles.beneficioNota}>{b.nota}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Colaboraciones */}
      <Text style={styles.seccionTitulo}>Colaboraciones</Text>
      {COLABS.map((c, i) => (
        <View key={i} style={[styles.colabCard, !esPremium && styles.colabCardBloqueado]}>
          <View style={styles.colabHeader}>
            <Text style={styles.colabEmoji}>{c.emoji}</Text>
            <View>
              <Text style={styles.colabNombre}>{c.nombre}</Text>
              <Text style={styles.colabCategoria}>{c.categoria}</Text>
            </View>
          </View>
          {c.beneficios.map((b, j) => (
            <View key={j} style={styles.colabBeneficioRow}>
              <Text style={styles.colabGuion}>—</Text>
              <Text style={styles.colabBeneficio}>{b}</Text>
            </View>
          ))}
          {!esPremium && (
            <View style={styles.lockBadge}>
              <Text style={styles.lockBadgeText}>Disponible con plan Ilimitado o superior</Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label.toUpperCase()}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statSub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, gap: 14, paddingBottom: 32 },
  loadingContainer: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },

  header: { marginBottom: 4 },
  headerTitulo: {
    fontSize: 28,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '300',
    color: C.text,
  },
  headerSubtitulo: { fontSize: 13, color: C.textSoft, marginTop: 2 },

  upgradeBanner: {
    backgroundColor: C.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  upgradeBannerText: { fontSize: 14, fontWeight: '600', color: '#fff' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    flex: 1,
    minWidth: '45%',
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
    fontSize: 24,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '300',
    color: C.text,
  },
  statSub: { fontSize: 11, color: C.textSoft },

  card: {
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: C.text,
    marginBottom: 4,
  },

  beneficioRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  beneficioCheck: { fontSize: 16, color: C.textMuted, marginTop: 1 },
  beneficioCheckActive: { color: C.accent },
  beneficioTexto: { fontSize: 13, fontWeight: '500', color: C.text },
  beneficioNota: { fontSize: 11, color: C.textSoft, marginTop: 1 },
  textMuted: { color: C.textMuted },

  seccionTitulo: {
    fontSize: 20,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: C.text,
    marginTop: 4,
  },

  colabCard: {
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  colabCardBloqueado: { opacity: 0.65 },
  colabHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  colabEmoji: { fontSize: 22 },
  colabNombre: { fontSize: 14, fontWeight: '600', color: C.text },
  colabCategoria: { fontSize: 11, color: C.textSoft },
  colabBeneficioRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  colabGuion: { fontSize: 12, color: C.accent },
  colabBeneficio: { fontSize: 12, color: C.textSoft, flex: 1, lineHeight: 17 },
  lockBadge: {
    backgroundColor: '#F5EDE0',
    borderRadius: 6,
    padding: 8,
    marginTop: 4,
  },
  lockBadgeText: { fontSize: 11, color: C.textSoft },
});
