import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { cargarMaestra, claseConReservas, marcarAsistencia, etiquetaDia, hhmm, reservadas, type ClaseM, type ReservaM } from '../../../lib/maestra';
import { hoyEstudio } from '../../../lib/tiempo';
import { avisar } from '../../../lib/alert';
import { C } from '../../../constants/colors';
import { F } from '../../../constants/fonts';

// Ciclo al tocar: confirmada -> asistio -> no_asistio -> confirmada
const SIGUIENTE: Record<string, string> = { confirmada: 'asistio', asistio: 'no_asistio', no_asistio: 'confirmada' };

export default function AsistenciaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [clase, setClase] = useState<ClaseM | null>(null);
  const [reservas, setReservas] = useState<ReservaM[] | null>(null);
  const [puede, setPuede] = useState(false);
  const [esPropia, setEsPropia] = useState(false);
  const [error, setError] = useState('');
  const [ocupado, setOcupado] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const [m, d] = await Promise.all([cargarMaestra(), claseConReservas(String(id))]);
        if (!vivo) return;
        setPuede(!!m && d.clase?.maestra_id === m.id && m.puede_asistencias !== false);
        setEsPropia(!!m && d.clase?.maestra_id === m.id);
        setClase(d.clase);
        setReservas(d.reservas);
      } catch {
        if (vivo) { setReservas([]); setError('No se pudo cargar la clase. Regresa e inténtalo de nuevo.'); }
      }
    })();
    return () => { vivo = false; };
  }, [id]);

  const lista = reservas ?? [];
  const total = lista.length;
  const cuenta = lista.filter((r) => r.estado === 'asistio').length;

  async function cambiar(r: ReservaM, nuevo: string) {
    if (ocupado[r.id]) return;
    const previo = r.estado;
    setOcupado((o) => ({ ...o, [r.id]: true }));
    setReservas((rs) => (rs ?? []).map((x) => (x.id === r.id ? { ...x, estado: nuevo } : x)));
    const res = await marcarAsistencia(r.id, nuevo);
    setOcupado((o) => ({ ...o, [r.id]: false }));
    if (!res.ok) {
      setReservas((rs) => (rs ?? []).map((x) => (x.id === r.id ? { ...x, estado: previo } : x)));
      avisar('No se guardó', res.error ?? 'Intenta de nuevo.');
    }
  }

  function alternar(r: ReservaM) {
    if (!puede) return;
    cambiar(r, SIGUIENTE[r.estado] ?? 'asistio');
  }

  async function marcarTodas() {
    if (!puede) return;
    const todas = total > 0 && cuenta === total;
    const objetivo = todas ? 'confirmada' : 'asistio';
    for (const r of lista.filter((x) => x.estado !== objetivo)) await cambiar(r, objetivo);
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.replace('/(maestra)/clases' as any)} activeOpacity={0.7} style={styles.volver}>
        <Ionicons name="chevron-back" size={18} color={C.accent} />
        <Text style={styles.volverTxt}>Mis clases</Text>
      </TouchableOpacity>

      {reservas === null && <ActivityIndicator color={C.accent} style={{ marginTop: 20 }} />}
      {!!error && <Text style={styles.vacio}>{error}</Text>}

      {clase && (
        <View style={styles.resumen}>
          <Text style={styles.resumenHora}>{etiquetaDia(clase.fecha, hoyEstudio())} · {hhmm(clase.hora)} – {hhmm(clase.hora_fin)}</Text>
          <Text style={styles.resumenTitulo}>{clase.titulo}</Text>
          {!!clase.ubicacion && <Text style={styles.resumenSub}>{clase.ubicacion}</Text>}
          <View style={styles.contador}>
            <Text style={styles.contadorNum}>{cuenta}</Text>
            <Text style={styles.contadorDe}> de {total} presentes</Text>
          </View>
        </View>
      )}

      {reservas !== null && !error && (
        <>
          <View style={styles.listaHeader}>
            <Text style={styles.listaTitulo}>Alumnas</Text>
            {puede && total > 0 && (
              <TouchableOpacity onPress={marcarTodas} activeOpacity={0.7}>
                <Text style={styles.marcarTodas}>{cuenta === total ? 'Quitar todas' : 'Marcar todas'}</Text>
              </TouchableOpacity>
            )}
          </View>

          {total === 0 ? (
            <Text style={styles.vacio}>Aún no hay alumnas reservadas en esta clase.</Text>
          ) : (
            <View style={styles.lista}>
              {lista.map((a, i) => {
                const ok = a.estado === 'asistio';
                const no = a.estado === 'no_asistio';
                return (
                  <TouchableOpacity
                    key={a.id}
                    style={[styles.fila, i < lista.length - 1 && styles.filaDivider]}
                    activeOpacity={0.7}
                    onPress={() => alternar(a)}
                  >
                    <View style={styles.avatar}>
                      <Text style={styles.avatarTxt}>{a.nombre.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.nombre}>{a.nombre}</Text>
                      {!!a.numero_alumno && <Text style={styles.paquete}>N.º {a.numero_alumno}</Text>}
                    </View>
                    <View style={[styles.check, ok && styles.checkOn, no && styles.checkNo]}>
                      {ok && <Ionicons name="checkmark" size={16} color="#fff" />}
                      {no && <Ionicons name="close" size={16} color="#fff" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
          <Text style={styles.nota}>
            {puede ? 'Toca una alumna: presente ✓ · no asistió ✕ · sin marcar. Se guarda al instante.' : (esPropia ? 'No tienes permiso para tomar asistencia. Solo puedes verla.' : 'Esta clase es de otra maestra: solo puedes ver las reservas.')}
          </Text>
        </>
      )}
    </ScrollView>
  );
}

const sombra = { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 };

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  volver: { flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf: 'flex-start' },
  volverTxt: { fontSize: 14, color: C.accent, fontFamily: F.medium },

  resumen: { backgroundColor: C.white, borderRadius: 14, padding: 20, gap: 4, ...sombra },
  resumenHora: { fontSize: 12, color: C.accent, fontFamily: F.semibold, letterSpacing: 0.5 },
  resumenTitulo: { fontSize: 22, color: C.text, fontFamily: F.regular },
  resumenSub: { fontSize: 13, color: C.textSoft },
  contador: { flexDirection: 'row', alignItems: 'baseline', marginTop: 12 },
  contadorNum: { fontSize: 30, color: C.text, fontFamily: F.regular },
  contadorDe: { fontSize: 14, color: C.textSoft },

  listaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  listaTitulo: { fontSize: 18, fontFamily: F.regular, color: C.text },
  marcarTodas: { fontSize: 13, color: C.accent, fontFamily: F.medium },

  lista: { backgroundColor: C.white, borderRadius: 14, ...sombra },
  fila: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, gap: 14 },
  filaDivider: { borderBottomWidth: 1, borderBottomColor: C.border },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontSize: 16, color: C.accent, fontFamily: F.semibold },
  nombre: { fontSize: 15, color: C.text, fontFamily: F.regular },
  paquete: { fontSize: 12, color: C.textSoft, marginTop: 1 },
  check: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: C.accent, borderColor: C.accent },

  vacio: { fontSize: 14, color: C.textSoft, textAlign: 'center', marginTop: 12, lineHeight: 20, padding: 12 },
  nota: { fontSize: 12, color: C.textSoft, textAlign: 'center' },
  checkNo: { backgroundColor: C.errorRed, borderColor: C.errorRed },
});
