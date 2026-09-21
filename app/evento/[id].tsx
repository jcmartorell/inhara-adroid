import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { C } from '../../constants/colors';

interface Evento {
  id: string;
  titulo: string;
  descripcion: string | null;
  foto_url: string | null;
  fecha: string;
  hora: string | null;
  hora_fin: string | null;
  lugar: string | null;
  capacidad: number | null;
  precio: number | null;
}

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function fechaLarga(f: string) {
  const d = new Date(f + 'T12:00:00');
  return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`;
}
const hhmm = (h: string | null) => (h ?? '').slice(0, 5);

export default function EventoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [evento, setEvento] = useState<Evento | null>(null);
  const [loading, setLoading] = useState(true);
  const [fotoFalla, setFotoFalla] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('eventos')
        .select('id, titulo, descripcion, foto_url, fecha, hora, hora_fin, lugar, capacidad, precio')
        .eq('id', id)
        .eq('activo', true)
        .maybeSingle();
      setEvento(data ?? null);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={C.accent} size="large" /></View>;
  }
  if (!evento) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>📅</Text>
        <Text style={styles.emptyText}>Este evento ya no está disponible</Text>
      </View>
    );
  }

  const horario = evento.hora ? `${hhmm(evento.hora)}${evento.hora_fin ? ` – ${hhmm(evento.hora_fin)}` : ''} hrs` : '';

  return (
    <ScrollView style={styles.root} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>
      {evento.foto_url && !fotoFalla ? (
        <Image source={{ uri: evento.foto_url }} style={styles.foto} resizeMode="cover" onError={() => setFotoFalla(true)} />
      ) : null}

      <Text style={styles.titulo}>{evento.titulo}</Text>

      <View style={styles.datos}>
        <View style={styles.fila}>
          <Text style={styles.icono}>📅</Text>
          <Text style={styles.dato}>{fechaLarga(evento.fecha)}{horario ? `\n${horario}` : ''}</Text>
        </View>
        {evento.lugar ? (
          <View style={styles.fila}>
            <Text style={styles.icono}>📍</Text>
            <Text style={styles.dato}>{evento.lugar}</Text>
          </View>
        ) : null}
        {evento.precio != null && Number(evento.precio) > 0 ? (
          <View style={styles.fila}>
            <Text style={styles.icono}>💲</Text>
            <Text style={styles.dato}>${Number(evento.precio).toLocaleString('es-MX')} MXN</Text>
          </View>
        ) : null}
        {evento.capacidad != null ? (
          <View style={styles.fila}>
            <Text style={styles.icono}>👥</Text>
            <Text style={styles.dato}>Cupo limitado: {evento.capacidad} personas</Text>
          </View>
        ) : null}
      </View>

      {evento.descripcion ? <Text style={styles.descripcion}>{evento.descripcion}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, gap: 14 },
  center: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 15, color: C.textSoft, textAlign: 'center' },

  foto: { width: '100%', height: 220, borderRadius: 14, backgroundColor: C.border },
  titulo: { fontSize: 26, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontWeight: '300', color: C.text, lineHeight: 32 },
  datos: {
    backgroundColor: C.white, borderRadius: 14, padding: 16, gap: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  fila: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  icono: { fontSize: 18, width: 26, textAlign: 'center' },
  dato: { flex: 1, fontSize: 14, color: C.text, lineHeight: 20, textTransform: 'none' },
  descripcion: { fontSize: 14, color: C.textSoft, lineHeight: 22 },
});
