import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { cargarPerfilBasico } from '../../lib/rol';
import { cargarMaestra, clasesDeMaestra, hhmm, reservadas, type ClaseM } from '../../lib/maestra';
import { hoyEstudio } from '../../lib/tiempo';
import { C } from '../../constants/colors';
import { F } from '../../constants/fonts';

export default function HoyScreen() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [clases, setClases] = useState<ClaseM[] | null>(null);
  const [error, setError] = useState('');
  const [refrescando, setRefrescando] = useState(false);

  async function cargar() {
    try {
      setError('');
      const m = await cargarMaestra();
      if (!m) { setClases([]); setError('Tu cuenta aún no está vinculada a una maestra. Avisa a administración.'); return; }
      const hoyStr = hoyEstudio();
      setClases(await clasesDeMaestra(m.id, hoyStr, hoyStr));
    } catch {
      setClases((c) => c ?? []);
      setError('No se pudieron cargar tus clases. Desliza hacia abajo para reintentar.');
    }
  }

  useEffect(() => { cargar(); }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) cargarPerfilBasico(session.user.id).then((p) => setNombre(p.nombre ?? '')).catch(() => {});
    });
  }, []);

  const hoy = clases ?? [];
  const proxima = hoy[0];
  const resto = hoy.slice(1);
  const alumnasHoy = hoy.reduce((s, c) => s + reservadas(c), 0);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={async () => { setRefrescando(true); await cargar(); setRefrescando(false); }} tintColor={C.accent} />}
    >
      <View style={styles.header}>
        <Image source={require('../../assets/logo-inhara.png')} style={styles.headerLogo} resizeMode="contain" accessibilityLabel="Inhara" />
        <Text style={styles.headerSub}>Bienvenida</Text>
        <Text style={styles.headerName}>{nombre || 'Maestra'}</Text>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{hoy.length}</Text>
            <Text style={styles.statLabel}>clases hoy</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>{alumnasHoy}</Text>
            <Text style={styles.statLabel}>alumnas reservadas</Text>
          </View>
        </View>
      </View>

      {clases === null && <ActivityIndicator color={C.accent} style={{ marginTop: 20 }} />}
      {!!error && <Text style={styles.vacio}>{error}</Text>}
      {clases !== null && !error && hoy.length === 0 && <Text style={styles.vacio}>No tienes clases hoy.</Text>}

      {proxima && (
        <>
          <Text style={styles.seccion}>Próxima clase</Text>
          <View style={styles.proximaCard}>
            <Text style={styles.proximaHora}>{hhmm(proxima.hora)} – {hhmm(proxima.hora_fin)}</Text>
            <Text style={styles.proximaTitulo}>{proxima.titulo}</Text>
            <Text style={styles.proximaSub}>{proxima.ubicacion ? proxima.ubicacion + ' · ' : ''}{reservadas(proxima)} de {proxima.capacidad} lugares</Text>
            <TouchableOpacity
              style={styles.boton}
              activeOpacity={0.85}
              onPress={() => router.push(`/(maestra)/clase/${proxima.id}` as any)}
            >
              <Text style={styles.botonTexto}>Tomar asistencia</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {resto.length > 0 && <Text style={styles.seccion}>Más tarde hoy</Text>}
      {resto.map((c) => (
        <TouchableOpacity
          key={c.id}
          style={styles.fila}
          activeOpacity={0.8}
          onPress={() => router.push(`/(maestra)/clase/${c.id}` as any)}
        >
          <View style={styles.filaHora}>
            <Text style={styles.filaHoraTxt}>{hhmm(c.hora)}</Text>
            <Text style={styles.filaHoraFin}>{hhmm(c.hora_fin)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.filaTitulo}>{c.titulo}</Text>
            <Text style={styles.filaSub}>{reservadas(c)} de {c.capacidad} lugares</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const sombra = { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 };

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, gap: 14, paddingBottom: 40 },

  header: { backgroundColor: C.white, borderRadius: 16, padding: 24, alignItems: 'center', gap: 4, ...sombra },
  headerLogo: { width: 120, height: 37, marginBottom: 14 },
  headerSub: { fontSize: 12, color: C.textSoft, letterSpacing: 0.5 },
  headerName: { fontSize: 28, color: C.text, fontFamily: F.regular },
  stats: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 20 },
  stat: { alignItems: 'center', gap: 2 },
  statNum: { fontSize: 20, fontFamily: F.regular, color: C.text },
  statLabel: { fontSize: 10, color: C.textSoft, letterSpacing: 0.3 },
  statDivider: { width: 1, height: 32, backgroundColor: C.border },

  vacio: { fontSize: 14, color: C.textSoft, textAlign: 'center', marginTop: 12, lineHeight: 20 },
  seccion: { fontSize: 18, fontFamily: F.regular, color: C.text, marginTop: 6 },

  proximaCard: { backgroundColor: C.white, borderRadius: 14, padding: 20, gap: 4, ...sombra },
  proximaHora: { fontSize: 13, color: C.accent, fontFamily: F.semibold, letterSpacing: 0.5 },
  proximaTitulo: { fontSize: 22, color: C.text, fontFamily: F.regular },
  proximaSub: { fontSize: 13, color: C.textSoft },
  boton: { marginTop: 14, height: 46, borderRadius: 8, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  botonTexto: { fontSize: 15, fontFamily: F.semibold, color: '#fff' },

  fila: { backgroundColor: C.white, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14, ...sombra },
  filaHora: { width: 52 },
  filaHoraTxt: { fontSize: 16, fontFamily: F.semibold, color: C.text },
  filaHoraFin: { fontSize: 12, color: C.textMuted },
  filaTitulo: { fontSize: 16, fontFamily: F.regular, color: C.text },
  filaSub: { fontSize: 12, color: C.accent, marginTop: 2 },
});
