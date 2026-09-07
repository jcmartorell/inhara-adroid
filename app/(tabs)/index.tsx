import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Platform,
  TouchableOpacity, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { C } from '../../constants/colors';
import { getNivel, getProgresoPct } from '../../lib/camino';
import type { Profile, Suscripcion } from '../../lib/models';

interface ReservaProxima {
  id: string;
  clase_id: string;
  clase_titulo: string;
  clase_fecha: string;
  clase_hora: string;
  clase_hora_fin: string;
}

const DIAS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const MESES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

function formatFecha(f: string) {
  const d = new Date(f + 'T12:00:00');
  return `${DIAS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]}`;
}
function formatHora(h: string) { return h.slice(0, 5); }
function pad(n: number) { return String(n).padStart(2, '0'); }
function fechaHoy() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

export default function DashboardScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [totalClases, setTotalClases] = useState(0);
  const [susActiva, setSusActiva] = useState<Suscripcion | null>(null);
  const [planNombre, setPlanNombre] = useState('');
  const [reservasProximas, setReservasProximas] = useState<ReservaProxima[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelando, setCancelando] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const userId = session.user.id;

    const [{ data: prof }, { data: asist }, { data: sus }, { data: reservas }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).limit(1),
      supabase.from('asistencias').select('id').eq('user_id', userId),
      supabase.from('suscripciones').select('*').eq('user_id', userId).eq('estado', 'activo').limit(1),
      supabase.from('reservas').select('id, clase_id, estado').eq('user_id', userId).eq('estado', 'confirmada'),
    ]);

    if (prof?.[0]) setProfile(prof[0]);
    setTotalClases(asist?.length ?? 0);

    const susData = sus?.[0] ?? null;
    setSusActiva(susData);

    if (susData?.plan_id) {
      const { data: planes } = await supabase.from('planes').select('nombre').eq('id', susData.plan_id).limit(1);
      setPlanNombre(planes?.[0]?.nombre ?? '');
    }

    // Cargar clases de reservas próximas
    if (reservas?.length) {
      const ids = reservas.map((r: any) => r.clase_id);
      const { data: clases } = await supabase
        .from('clases')
        .select('id, titulo, fecha, hora, hora_fin')
        .in('id', ids)
        .gte('fecha', fechaHoy())
        .order('fecha').order('hora');

      const proximas: ReservaProxima[] = (clases ?? []).flatMap((c: any) => {
        const res = reservas.find((r: any) => r.clase_id === c.id);
        if (!res) return [];
        return [{ id: res.id, clase_id: c.id, clase_titulo: c.titulo, clase_fecha: c.fecha, clase_hora: c.hora, clase_hora_fin: c.hora_fin }];
      });
      setReservasProximas(proximas);
    } else {
      setReservasProximas([]);
    }

    setLoading(false);
    setRefreshing(false);
  }

  const onRefresh = useCallback(() => { setRefreshing(true); load(); }, []);

  async function cancelarReserva(r: ReservaProxima) {
    Alert.alert('Cancelar clase', `¿Cancelar ${r.clase_titulo} el ${formatFecha(r.clase_fecha)}?`, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar', style: 'destructive',
        onPress: async () => {
          setCancelando(r.id);
          await supabase.from('reservas').update({ estado: 'cancelada' }).eq('id', r.id);
          await load();
          setCancelando(null);
        },
      },
    ]);
  }

  const router = useRouter();
  const nivel = getNivel(totalClases);
  const pct = getProgresoPct(totalClases);

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator color={C.accent} size="large" /></View>;
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
    >
      {/* Header bienvenida */}
      <View style={styles.header}>
        <Text style={styles.headerSub}>Bienvenida</Text>
        <Text style={styles.headerName}>{profile?.nombre ?? ''}</Text>
        <View style={styles.headerStats}>
          <View style={styles.headerStat}>
            <Text style={styles.headerStatNum}>{totalClases}</Text>
            <Text style={styles.headerStatLabel}>clases totales</Text>
          </View>
          <View style={styles.headerStatDivider} />
          <View style={styles.headerStat}>
            <Text style={styles.headerStatNum}>{nivel.nombre}</Text>
            <Text style={styles.headerStatLabel}>nivel El Camino</Text>
          </View>
        </View>
      </View>

      {/* Paquete activo */}
      <View style={styles.paqueteCard}>
        <View style={styles.paqueteLeft}>
          <Text style={styles.paqueteLabel}>PAQUETE ACTIVO</Text>
          <Text style={styles.paqueteNombre}>{planNombre || 'Sin paquete activo'}</Text>
        </View>
        <View style={styles.paqueteRight}>
          <Text style={styles.paqueteClasesNum}>
            {susActiva?.ilimitado ? '∞' : susActiva?.clases_restantes != null ? String(susActiva.clases_restantes) : '0'}
          </Text>
          <Text style={styles.paqueteClasesLabel}>clases</Text>
        </View>
      </View>

      {/* Botón Lealtad / Promociones */}
      <TouchableOpacity style={styles.lealtadBtn} onPress={() => router.push('/lealtad')} activeOpacity={0.85}>
        <View style={styles.lealtadBtnLeft}>
          <Ionicons name="heart" size={20} color={C.gold} />
          <View>
            <Text style={styles.lealtadBtnTitulo}>Mat to Heart</Text>
            <Text style={styles.lealtadBtnSub}>Ver tus beneficios y colaboraciones</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={C.gold + '88'} />
      </TouchableOpacity>

      {/* Reservas próximas */}
      <View style={styles.seccionHeader}>
        <Text style={styles.seccionTitulo}>Mis próximas clases</Text>
      </View>

      {reservasProximas.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No tienes clases reservadas</Text>
          <Text style={styles.emptyHint}>Ve a Clases para reservar tu lugar</Text>
        </View>
      ) : (
        reservasProximas.map((r) => (
          <View key={r.id} style={styles.reservaCard}>
            <View style={styles.reservaLeft}>
              <View style={styles.reservaHoraBlock}>
                <Text style={styles.reservaHora}>{formatHora(r.clase_hora)}</Text>
                <Text style={styles.reservaHoraFin}>{formatHora(r.clase_hora_fin)}</Text>
              </View>
              <View>
                <Text style={styles.reservaTitulo}>{r.clase_titulo}</Text>
                <Text style={styles.reservaFecha}>{formatFecha(r.clase_fecha)}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => cancelarReserva(r)}
              disabled={cancelando === r.id}
              activeOpacity={0.7}
            >
              {cancelando === r.id
                ? <ActivityIndicator color={C.accent} size="small" />
                : <Text style={styles.cancelBtnText}>Cancelar</Text>
              }
            </TouchableOpacity>
          </View>
        ))
      )}

      {/* Nivel El Camino */}
      <View style={styles.nivelCard}>
        <View style={styles.nivelHeader}>
          <View>
            <Text style={styles.nivelBadge}>EL CAMINO · NIVEL {nivel.num} DE 9</Text>
            <Text style={styles.nivelNombre}>{nivel.nombre}</Text>
          </View>
          <Text style={styles.nivelPct}>{Math.round(pct)}%</Text>
        </View>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>
        <Text style={styles.nivelEnsenanza}>&ldquo;{nivel.ensenanza}&rdquo;</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  loadingContainer: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },

  header: { backgroundColor: C.brown, borderRadius: 16, padding: 24, alignItems: 'center', gap: 4 },
  headerSub: { fontSize: 12, color: C.gold + '99', letterSpacing: 0.5 },
  headerName: { fontSize: 28, color: C.gold, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontWeight: '300' },
  headerStats: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 20 },
  headerStat: { alignItems: 'center', gap: 2 },
  headerStatNum: { fontSize: 20, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', color: C.gold, fontWeight: '300' },
  headerStatLabel: { fontSize: 10, color: C.gold + '77', letterSpacing: 0.3 },
  headerStatDivider: { width: 1, height: 32, backgroundColor: C.gold + '33' },

  lealtadBtn: {
    backgroundColor: C.brown, borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  lealtadBtnLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  lealtadBtnTitulo: { fontSize: 15, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', color: C.gold },
  lealtadBtnSub: { fontSize: 11, color: C.gold + '77', marginTop: 1 },

  paqueteCard: {
    backgroundColor: C.white, borderRadius: 14, padding: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  paqueteLeft: { gap: 4 },
  paqueteLabel: { fontSize: 9, fontWeight: '700', color: C.textMuted, letterSpacing: 1 },
  paqueteNombre: { fontSize: 17, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', color: C.text },
  paqueteRight: { alignItems: 'center' },
  paqueteClasesNum: { fontSize: 34, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontWeight: '300', color: C.accent },
  paqueteClasesLabel: { fontSize: 11, color: C.textSoft, marginTop: -4 },

  seccionHeader: { marginTop: 4, marginBottom: -4 },
  seccionTitulo: { fontSize: 18, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', color: C.text },

  emptyCard: {
    backgroundColor: C.white, borderRadius: 14, padding: 20, alignItems: 'center', gap: 4,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  emptyText: { fontSize: 14, color: C.textSoft },
  emptyHint: { fontSize: 12, color: C.textMuted },

  reservaCard: {
    backgroundColor: C.white, borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2,
    borderLeftWidth: 3, borderLeftColor: C.accent,
  },
  reservaLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  reservaHoraBlock: { alignItems: 'center', minWidth: 42 },
  reservaHora: { fontSize: 15, fontWeight: '700', color: C.text },
  reservaHoraFin: { fontSize: 11, color: C.textMuted },
  reservaTitulo: { fontSize: 15, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', color: C.text },
  reservaFecha: { fontSize: 12, color: C.textSoft, marginTop: 2 },
  cancelBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1.5, borderColor: C.accent },
  cancelBtnText: { fontSize: 12, fontWeight: '600', color: C.accent },

  nivelCard: { backgroundColor: C.brown, borderRadius: 14, padding: 20, gap: 10 },
  nivelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  nivelBadge: { fontSize: 9, fontWeight: '600', color: C.gold + '80', letterSpacing: 1.5 },
  nivelNombre: { fontSize: 22, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontWeight: '300', color: C.gold, marginTop: 2 },
  nivelPct: { fontSize: 20, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', color: C.gold },
  progressBg: { height: 6, backgroundColor: C.gold + '33', borderRadius: 3 },
  progressFill: { height: 6, backgroundColor: C.gold, borderRadius: 3 },
  nivelEnsenanza: { fontSize: 12, fontStyle: 'italic', color: C.gold + '99' },
});
