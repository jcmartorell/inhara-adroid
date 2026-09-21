import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../constants/colors';
import { avisar } from '../lib/alert';
import { cargarEnvios, marcarLeidos, responder, ocultar, type Envio } from '../lib/mensajes';

function Estrellas({ onChange, disabled }: { onChange: (n: number) => void; disabled?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity key={n} onPress={() => onChange(n)} disabled={disabled} hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}>
          <Text style={{ fontSize: 34, color: '#E0D5C8' }}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function MensajesScreen() {
  const insets = useSafeAreaInsets();
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [borrador, setBorrador] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await cargarEnvios();
    setError(r.error ?? '');
    setEnvios(r.envios);
    setLoading(false);
    setRefreshing(false);
    if (!r.error) marcarLeidos(); // quita el aviso "mensajes nuevos" del inicio
  }, []);

  useEffect(() => { load(); }, [load]);

  async function contestar(envioId: string, datos: { estrellas?: number; opcion?: number; texto?: string }) {
    setEnviando(envioId);
    const r = await responder(envioId, datos);
    setEnviando(null);
    if (!r.ok) avisar('No se pudo enviar', r.error ?? 'Intenta de nuevo.');
    load();
  }

  async function quitar(envioId: string) {
    setEnvios((prev) => prev.filter((e) => e.id !== envioId));
    await ocultar(envioId);
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={C.accent} size="large" /></View>;
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>⚠️</Text>
        <Text style={styles.emptyText}>{error}</Text>
        <TouchableOpacity onPress={() => { setLoading(true); load(); }} style={styles.reintentar}>
          <Text style={styles.reintentarTexto}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.root}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.accent} />}
      >
        {envios.length === 0 ? (
          <View style={[styles.center, { paddingTop: 80 }]}>
            <Text style={styles.emptyIcon}>📥</Text>
            <Text style={styles.emptyText}>No tienes mensajes por ahora</Text>
          </View>
        ) : null}

        {envios.map((e) => {
          const d = e.digest;
          const respondido = !!e.respondido_at;
          const puedeOcultar = d.tipo === 'mensaje' || respondido;
          return (
            <View key={e.id} style={styles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <Text style={[styles.titulo, { flex: 1 }]}>{d.titulo}</Text>
                {puedeOcultar && (
                  <TouchableOpacity onPress={() => quitar(e.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={styles.cerrarBtn}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
              {d.contenido ? <Text style={styles.contenido}>{d.contenido}</Text> : null}

              {d.tipo === 'satisfaccion' && (
                respondido ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 22, color: '#D4A034' }}>{'★'.repeat(e.respuesta_estrellas ?? 0)}</Text>
                    <Text style={styles.gracias}>¡Gracias por tu respuesta!</Text>
                  </View>
                ) : (
                  <Estrellas disabled={enviando === e.id} onChange={(n) => contestar(e.id, { estrellas: n })} />
                )
              )}

              {d.tipo === 'encuesta' && (
                respondido ? (
                  <Text style={styles.respondidoTexto}>
                    ✓ Elegiste: <Text style={{ fontWeight: '600' }}>{d.opciones?.[e.respuesta_opcion ?? -1]}</Text>
                  </Text>
                ) : (
                  <View style={{ gap: 8 }}>
                    {(d.opciones ?? []).map((op, i) => (
                      <TouchableOpacity key={i} disabled={enviando === e.id} onPress={() => contestar(e.id, { opcion: i })} style={styles.opcionBtn}>
                        <Text style={styles.opcionTexto}>{op}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )
              )}

              {d.tipo === 'pregunta' && (
                respondido ? (
                  <Text style={styles.respondidoTexto}>✓ Respondiste: <Text style={{ fontStyle: 'italic' }}>{e.respuesta_texto}</Text></Text>
                ) : (
                  <View style={{ gap: 8 }}>
                    <TextInput
                      value={borrador[e.id] ?? ''}
                      onChangeText={(t) => setBorrador((b) => ({ ...b, [e.id]: t }))}
                      placeholder="Escribe tu respuesta..."
                      placeholderTextColor={C.textMuted}
                      style={styles.input}
                      multiline
                      maxLength={1000}
                    />
                    <TouchableOpacity
                      disabled={enviando === e.id || !(borrador[e.id] ?? '').trim()}
                      onPress={() => contestar(e.id, { texto: (borrador[e.id] ?? '').trim() })}
                      style={[styles.enviarBtn, (enviando === e.id || !(borrador[e.id] ?? '').trim()) && { opacity: 0.5 }]}
                    >
                      <Text style={styles.enviarBtnTexto}>{enviando === e.id ? 'Enviando...' : 'Enviar respuesta'}</Text>
                    </TouchableOpacity>
                  </View>
                )
              )}

              {d.tipo === 'mensaje' && <Text style={styles.leido}>Mensaje informativo</Text>}
            </View>
          );
        })}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, gap: 12 },
  center: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 15, color: C.textSoft, textAlign: 'center' },
  reintentar: { marginTop: 4, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: C.accent },
  reintentarTexto: { color: '#fff', fontWeight: '600', fontSize: 14 },

  card: {
    backgroundColor: C.white, borderRadius: 14, padding: 18, gap: 10,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  titulo: { fontSize: 16, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', color: C.text, lineHeight: 22 },
  contenido: { fontSize: 13, color: C.textSoft, lineHeight: 19 },
  gracias: { fontSize: 12, color: C.textSoft },
  respondidoTexto: { fontSize: 13, color: '#2A6A40' },
  leido: { fontSize: 11, color: C.textMuted },

  opcionBtn: { padding: 14, borderWidth: 1, borderColor: '#E0D5C8', borderRadius: 10, backgroundColor: C.white },
  opcionTexto: { fontSize: 14, color: C.text },

  input: {
    minHeight: 84, padding: 12, borderWidth: 1, borderColor: '#E0D5C8', borderRadius: 10,
    fontSize: 14, color: C.text, textAlignVertical: 'top',
  },
  enviarBtn: { paddingVertical: 12, alignItems: 'center', backgroundColor: C.accent, borderRadius: 10 },
  enviarBtnTexto: { fontSize: 14, color: 'white', fontWeight: '600' },
  cerrarBtn: { fontSize: 16, color: C.textMuted, paddingHorizontal: 2 },
});
