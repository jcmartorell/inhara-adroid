import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { cargarPerfilBasico } from '../../lib/rol';
import { cargarMaestra, estadisticasMaestra, type EstadisticasM } from '../../lib/maestra';
import { hoyEstudio } from '../../lib/tiempo';
import { C } from '../../constants/colors';
import { F } from '../../constants/fonts';

export default function MasMaestraScreen() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [est, setEst] = useState<EstadisticasM | null>(null);
  const [errEst, setErrEst] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      setEmail(session.user.email ?? '');
      cargarPerfilBasico(session.user.id).then((p) => setNombre(p.nombre ?? '')).catch(() => {});
    });
    (async () => {
      try {
        const m = await cargarMaestra();
        if (m) setEst(await estadisticasMaestra(m.id, hoyEstudio()));
        else setErrEst(true);
      } catch { setErrEst(true); }
    })();
  }, []);

  const maxMes = Math.max(...(est?.meses ?? []).map((x) => x.count), 1);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.titulo}>Mi Inhara</Text>

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTxt}>{(nombre || 'M').charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.nombre}>{nombre || 'Maestra'}</Text>
          {email ? <Text style={styles.email}>{email}</Text> : null}
          <Text style={styles.rol}>Maestra · Inhara Yoga Studio</Text>
        </View>
      </View>

      {!est && !errEst && <ActivityIndicator color={C.accent} style={{ marginTop: 24 }} />}
      {est && (
        <>
          <View style={styles.stats}>
            {[
              { n: est.totalClases, l: 'Clases impartidas', s: 'total histórico' },
              { n: est.alumnosMes, l: 'Alumnos este mes', s: 'asistencias' },
              { n: est.clasesMes, l: 'Clases este mes', s: 'impartidas' },
            ].map((x) => (
              <View key={x.l} style={styles.statBox}>
                <Text style={styles.statNum}>{x.n}</Text>
                <Text style={styles.statLabel}>{x.l}</Text>
                <Text style={styles.statSub}>{x.s}</Text>
              </View>
            ))}
          </View>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitulo}>Asistencias · últimos 6 meses</Text>
            <View style={styles.chart}>
              {est.meses.map((mm, i) => (
                <View key={i} style={styles.barCol}>
                  <Text style={styles.barVal}>{mm.count}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.bar, { height: `${Math.max(mm.count / maxMes, mm.count > 0 ? 0.04 : 0) * 100}%` }, i === est.meses.length - 1 && styles.barActual]} />
                  </View>
                  <Text style={styles.barLabel}>{mm.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </>
      )}
      {errEst && <Text style={styles.errEst}>No se pudieron cargar tus estadísticas.</Text>}

      <TouchableOpacity style={styles.salirBtn} onPress={() => supabase.auth.signOut()} activeOpacity={0.7}>
        <Text style={styles.salirTxt}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingBottom: 40 },
  titulo: { fontSize: 28, fontFamily: F.regular, color: C.text, marginBottom: 20 },
  card: {
    backgroundColor: C.white, borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontSize: 20, color: C.accent, fontFamily: F.semibold },
  nombre: { fontSize: 17, color: C.text, fontFamily: F.regular },
  email: { fontSize: 12, color: C.textSoft, marginTop: 1 },
  rol: { fontSize: 12, color: C.accent, marginTop: 3, fontFamily: F.medium },
  stats: { flexDirection: 'row', gap: 10, marginTop: 14 },
  statBox: { flex: 1, backgroundColor: C.white, borderRadius: 14, padding: 12, alignItems: 'center', gap: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  statNum: { fontSize: 26, fontFamily: F.regular, color: C.text },
  statLabel: { fontSize: 11, color: C.text, textAlign: 'center', fontFamily: F.medium },
  statSub: { fontSize: 10, color: C.textMuted, textAlign: 'center' },
  chartCard: { backgroundColor: C.white, borderRadius: 14, padding: 16, marginTop: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  chartTitulo: { fontSize: 14, fontFamily: F.medium, color: C.text, marginBottom: 12 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 150 },
  barCol: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  barVal: { fontSize: 11, color: C.textSoft },
  barTrack: { width: '100%', flex: 1, justifyContent: 'flex-end' },
  bar: { width: '100%', backgroundColor: C.gold, borderRadius: 4 },
  barActual: { backgroundColor: C.accent },
  barLabel: { fontSize: 11, color: C.textSoft, textTransform: 'capitalize' },
  errEst: { fontSize: 13, color: C.textSoft, textAlign: 'center', marginTop: 20 },
  salirBtn: { marginTop: 32, alignItems: 'center', paddingVertical: 10 },
  salirTxt: { fontSize: 14, color: C.textMuted },
});
