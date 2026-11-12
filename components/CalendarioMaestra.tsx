import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { cargarMaestra, todasLasClases, etiquetaDia, hhmm, reservadas, sumarDias, type ClaseM } from '../lib/maestra';
import { hoyEstudio } from '../lib/tiempo';
import { C } from '../constants/colors';
import { F } from '../constants/fonts';

export default function CalendarioMaestra({ soloMias }: { soloMias: boolean }) {
  const router = useRouter();
  const [clases, setClases] = useState<ClaseM[] | null>(null);
  const [error, setError] = useState('');
  const [miId, setMiId] = useState<string | null>(null);
  const [nombres, setNombres] = useState<Record<string, string>>({});
  const [offset, setOffset] = useState(0); // semanas respecto a la actual (ventana de 2 semanas, como en la web)
  const [refrescando, setRefrescando] = useState(false);
  const hoy = hoyEstudio();
  // lunes de la semana actual + offset semanas; ventana de 14 días
  const dow = new Date(hoy + 'T12:00:00').getDay();
  const inicio = sumarDias(hoy, (dow === 0 ? -6 : 1 - dow) + offset * 7);
  const fin = sumarDias(inicio, 13);

  async function cargar() {
    try {
      setError('');
      const m = await cargarMaestra();
      setMiId(m?.id ?? null);
      const r = await todasLasClases(inicio, fin);
      setNombres(r.nombres);
      setClases(r.clases);
    } catch {
      setClases((c) => c ?? []);
      setError('No se pudieron cargar tus clases. Desliza hacia abajo para reintentar.');
    }
  }

  useEffect(() => { setClases(null); cargar(); }, [offset]);

  const lista = (clases ?? []).filter((c) => !soloMias || (!!miId && c.maestra_id === miId));
  const dias = Array.from(new Set(lista.map((c) => c.fecha)));

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={async () => { setRefrescando(true); await cargar(); setRefrescando(false); }} tintColor={C.accent} />}
    >
      <View style={styles.semanas}>
        <TouchableOpacity onPress={() => setOffset((o) => o - 1)} activeOpacity={0.7} style={styles.semBtn}>
          <Text style={styles.semBtnTxt}>‹ Anterior</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setOffset(0)} activeOpacity={0.7} style={{ flex: 1 }}>
          <Text style={styles.semRango}>{inicio.slice(8)}/{inicio.slice(5, 7)} – {fin.slice(8)}/{fin.slice(5, 7)}</Text>
          {offset !== 0 && <Text style={styles.semHoy}>Toca para volver a esta semana</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setOffset((o) => o + 1)} activeOpacity={0.7} style={styles.semBtn}>
          <Text style={styles.semBtnTxt}>Siguiente ›</Text>
        </TouchableOpacity>
      </View>
      {clases === null && <ActivityIndicator color={C.accent} style={{ marginTop: 20 }} />}
      {!!error && <Text style={styles.vacio}>{error}</Text>}
      {clases !== null && !error && lista.length === 0 && <Text style={styles.vacio}>{soloMias ? 'No tienes clases en este período.' : 'No hay clases en este período.'}</Text>}
      {dias.map((dia) => (
        <View key={dia} style={{ gap: 10 }}>
          <Text style={styles.dia}>{etiquetaDia(dia, hoy).toUpperCase()}</Text>
          {lista.filter((c) => c.fecha === dia).map((c) => {
            const res = reservadas(c);
            const llena = res >= c.capacidad;
            const mia = !!miId && c.maestra_id === miId;
            const quien = c.maestra_id ? nombres[c.maestra_id] : '';
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.card, mia && styles.cardMia]}
                activeOpacity={0.8}
                onPress={() => router.push(`/(maestra)/clase/${c.id}` as any)}
              >
                <View style={styles.horaBlock}>
                  <Text style={styles.hora}>{hhmm(c.hora)}</Text>
                  <Text style={styles.horaFin}>{hhmm(c.hora_fin)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.titulo}>{c.titulo}</Text>
                  <Text style={[styles.ubicacion, mia && { color: C.accent, fontFamily: F.semibold }]}>{quien || 'Sin asignar'}{mia ? ' (tú)' : ''}</Text>
                </View>
                <View style={[styles.pill, llena && styles.pillLlena]}>
                  <Text style={[styles.pillTxt, llena && styles.pillTxtLlena]}>
                    {res}/{c.capacidad}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, gap: 22, paddingBottom: 40 },
  vacio: { fontSize: 14, color: C.textSoft, textAlign: 'center', marginTop: 12, lineHeight: 20 },
  dia: { fontSize: 11, fontFamily: F.semibold, color: C.textMuted, letterSpacing: 1.5, marginLeft: 4 },
  card: {
    backgroundColor: C.white, borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  semanas: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  semBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: C.white, borderWidth: 1, borderColor: C.border },
  semBtnTxt: { fontSize: 13, color: C.accent, fontFamily: F.medium },
  semRango: { fontSize: 14, color: C.text, fontFamily: F.medium, textAlign: 'center' },
  semHoy: { fontSize: 10, color: C.textMuted, textAlign: 'center', marginTop: 2 },
  cardMia: { borderWidth: 1, borderColor: C.accent },
  horaBlock: { width: 52 },
  hora: { fontSize: 16, fontFamily: F.semibold, color: C.text },
  horaFin: { fontSize: 12, color: C.textMuted },
  titulo: { fontSize: 16, fontFamily: F.regular, color: C.text },
  ubicacion: { fontSize: 12, color: C.textSoft, marginTop: 2 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: C.bg },
  pillLlena: { backgroundColor: C.accent },
  pillTxt: { fontSize: 13, fontFamily: F.semibold, color: C.accent },
  pillTxtLlena: { color: '#fff' },
});
