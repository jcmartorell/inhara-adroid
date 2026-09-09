import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Platform,
  TouchableOpacity, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { reservarClase, cancelarReserva } from '../../lib/bookings';
import { C } from '../../constants/colors';

interface Clase {
  id: string;
  titulo: string;
  fecha: string;
  hora: string;
  hora_fin: string;
  spots_disponibles: number;
  capacidad: number;
  ubicacion: string | null;
  maestra_id: string | null;
}

interface Reserva {
  id: string;
  clase_id: string;
  estado: string;
}

const DIAS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const MESES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

function pad(n: number) { return String(n).padStart(2, '0'); }

function formatFecha(fecha: string) {
  const d = new Date(fecha + 'T12:00:00');
  return `${DIAS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]}`;
}

function formatHora(hora: string) {
  return hora.slice(0, 5);
}

function fechaHoy() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

export default function ClasesScreen() {
  const [clases, setClases] = useState<Clase[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [maestras, setMaestras] = useState<Record<string, string>>({});
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [procesando, setProcesando] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    setUserId(session.user.id);
    await Promise.all([loadClases(), loadReservas(session.user.id), loadMaestras()]);
    setLoading(false);
    setRefreshing(false);
  }

  async function loadClases() {
    const { data } = await supabase
      .from('clases')
      .select('id,titulo,fecha,hora,hora_fin,spots_disponibles,capacidad,ubicacion,maestra_id')
      .eq('activo', true)
      .gte('fecha', fechaHoy())
      .order('fecha')
      .order('hora');
    setClases(data ?? []);
  }

  async function loadMaestras() {
    const { data } = await supabase.from('profiles').select('id,nombre').eq('rol', 'maestra');
    const map: Record<string, string> = {};
    for (const m of data ?? []) {
      if (m.nombre) map[m.id] = m.nombre;
    }
    setMaestras(map);
  }

  async function loadReservas(uid: string) {
    const { data } = await supabase
      .from('reservas')
      .select('id,clase_id,estado')
      .eq('user_id', uid)
      .eq('estado', 'confirmada');
    setReservas(data ?? []);
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, []);

  async function reservar(clase: Clase) {
    if (!userId) return;
    if (new Date(`${clase.fecha}T${clase.hora}`).getTime() <= Date.now()) {
      Alert.alert('Clase ya iniciada', 'Esta clase ya empezó y no se puede reservar.');
      await loadClases();
      return;
    }
    setProcesando(clase.id);
    const { ok, error } = await reservarClase(clase.id);
    if (!ok) {
      Alert.alert('Error', error ?? 'No se pudo completar la reservación.');
    } else {
      await Promise.all([loadClases(), loadReservas(userId)]);
    }
    setProcesando(null);
  }

  async function cancelar(clase: Clase) {
    if (!userId) return;
    const reserva = reservas.find(r => r.clase_id === clase.id);
    if (!reserva) return;
    Alert.alert('Cancelar reservación', `¿Cancelar ${clase.titulo} el ${formatFecha(clase.fecha)}?`, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar', style: 'destructive',
        onPress: async () => {
          setProcesando(clase.id);
          const { ok, error } = await cancelarReserva(reserva.id);
          if (!ok) Alert.alert('Error', error ?? 'No se pudo cancelar la reservación.');
          await Promise.all([loadClases(), loadReservas(userId)]);
          setProcesando(null);
        },
      },
    ]);
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={C.accent} size="large" /></View>;
  }

  // Agrupar por fecha
  const porFecha: Record<string, Clase[]> = {};
  for (const c of clases) {
    if (!porFecha[c.fecha]) porFecha[c.fecha] = [];
    porFecha[c.fecha].push(c);
  }

  const fechas = Object.keys(porFecha).sort();

  if (!fechas.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>📅</Text>
        <Text style={styles.emptyText}>No hay clases próximas</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
    >
      {fechas.map(fecha => (
        <View key={fecha}>
          <Text style={styles.fechaHeader}>{formatFecha(fecha).toUpperCase()}</Text>
          {porFecha[fecha].map(clase => {
            const tieneReserva = reservas.some(r => r.clase_id === clase.id);
            const llena = clase.spots_disponibles <= 0 && !tieneReserva;
            const cargando = procesando === clase.id;
            const pasada = new Date(`${clase.fecha}T${clase.hora}`).getTime() <= Date.now();

            return (
              <View key={clase.id} style={[styles.claseCard, tieneReserva && styles.claseCardReservada, pasada && styles.claseCardPasada]}>
                <View style={styles.claseLeft}>
                  <View style={styles.horaBlock}>
                    <Text style={styles.hora}>{formatHora(clase.hora)}</Text>
                    <Text style={styles.horaFin}>{formatHora(clase.hora_fin)}</Text>
                  </View>
                  <View style={styles.claseInfo}>
                    <Text style={styles.claseTitulo}>{clase.titulo}</Text>
                    <Text style={styles.claseUbicacion}>{maestras[clase.maestra_id ?? ''] ?? 'Estudio Inhara'}</Text>
                    <Text style={[styles.claseSpots, llena && styles.claseSpotsLlena]}>
                      {pasada ? 'Clase pasada' : llena ? 'Sin lugares' : `${clase.spots_disponibles} lugar${clase.spots_disponibles !== 1 ? 'es' : ''}`}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.btn,
                    tieneReserva ? styles.btnCancelar : llena ? styles.btnLlena : styles.btnReservar,
                    pasada && styles.btnPasada,
                  ]}
                  onPress={() => tieneReserva ? cancelar(clase) : reservar(clase)}
                  disabled={llena || cargando || pasada}
                  activeOpacity={0.8}
                >
                  {cargando
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={tieneReserva || llena || pasada ? styles.btnText : styles.btnTextWhite}>
                        {pasada ? 'Pasada' : tieneReserva ? 'Cancelar' : llena ? 'Llena' : 'Reservar'}
                      </Text>
                  }
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 15, color: C.textSoft },

  fechaHeader: {
    fontSize: 11, fontWeight: '700', color: C.textMuted,
    letterSpacing: 1, marginTop: 20, marginBottom: 8, marginLeft: 4,
  },

  claseCard: {
    backgroundColor: C.white, borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  claseCardReservada: { borderWidth: 2, borderColor: C.accent + '66', backgroundColor: '#FFFAF4' },
  claseCardPasada: { opacity: 0.45 },

  claseLeft: { flexDirection: 'row', gap: 14, flex: 1 },
  horaBlock: { alignItems: 'center', minWidth: 42 },
  hora: { fontSize: 15, fontWeight: '700', color: C.text },
  horaFin: { fontSize: 11, color: C.textMuted, marginTop: 2 },

  claseInfo: { flex: 1, gap: 2 },
  claseTitulo: {
    fontSize: 16, color: C.text,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  claseUbicacion: { fontSize: 11, color: C.textSoft },
  claseSpots: { fontSize: 11, color: C.accent, fontWeight: '500', marginTop: 2 },
  claseSpotsLlena: { color: C.textMuted },

  btn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, minWidth: 78, alignItems: 'center' },
  btnReservar: { backgroundColor: C.accent },
  btnCancelar: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: C.accent },
  btnLlena: { backgroundColor: C.border },
  btnPasada: { backgroundColor: C.border },
  btnTextWhite: { fontSize: 13, fontWeight: '600', color: '#fff' },
  btnText: { fontSize: 13, fontWeight: '600', color: C.accent },
});
