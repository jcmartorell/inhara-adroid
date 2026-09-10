import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';

interface Digest {
  id: string;
  tipo: 'mensaje' | 'pregunta' | 'encuesta' | 'satisfaccion';
  titulo: string;
  contenido: string | null;
  opciones: string[] | null;
}

interface Envio {
  id: string;
  digest: Digest | null;
  leido: boolean;
  oculto?: boolean;
  respuesta_estrellas: number | null;
  respuesta_opcion: number | null;
  respuesta_texto: string | null;
  respondido_at: string | null;
}

function Estrellas({ valor, onChange }: { valor: number; onChange: (n: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity key={n} onPress={() => onChange(n)}>
          <Text style={{ fontSize: 30, color: n <= valor ? '#D4A034' : '#E0D5C8' }}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function MensajesScreen() {
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [loading, setLoading] = useState(true);
  const [borrador, setBorrador] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }
    const { data } = await supabase
      .from('digest_envios')
      .select('*, digest:digests(*)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    // Filtrado en JS (no en el query) por si la columna "oculto" todavía no
    // existe en Supabase — así nunca rompe la pantalla completa por un
    // error de "column does not exist".
    const lista = ((data ?? []) as Envio[]).filter((e) => !e.oculto);
    setEnvios(lista);
    const noLeidos = lista.filter((e) => !e.leido);
    if (noLeidos.length) {
      await supabase.from('digest_envios').update({ leido: true }).in('id', noLeidos.map((e) => e.id));
    }
    // Quitar el banner "tienes N mensajes nuevos" del home
    await supabase.from('notificaciones').update({ leida: true })
      .eq('user_id', session.user.id).eq('tipo', 'mensaje').eq('leida', false);
    setLoading(false);
  }

  async function ocultar(envioId: string) {
    setEnvios((prev) => prev.filter((e) => e.id !== envioId));
    await supabase.from('digest_envios').update({ oculto: true }).eq('id', envioId);
  }

  async function responderEstrellas(envioId: string, estrellas: number) {
    setEnviando(envioId);
    await supabase.from('digest_envios').update({ respuesta_estrellas: estrellas, respondido_at: new Date().toISOString() }).eq('id', envioId);
    setEnviando(null);
    load();
  }
  async function responderOpcion(envioId: string, opcion: number) {
    setEnviando(envioId);
    await supabase.from('digest_envios').update({ respuesta_opcion: opcion, respondido_at: new Date().toISOString() }).eq('id', envioId);
    setEnviando(null);
    load();
  }
  async function responderTexto(envioId: string) {
    const texto = (borrador[envioId] ?? '').trim();
    if (!texto) return;
    setEnviando(envioId);
    await supabase.from('digest_envios').update({ respuesta_texto: texto, respondido_at: new Date().toISOString() }).eq('id', envioId);
    setEnviando(null);
    load();
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={C.accent} size="large" /></View>;
  }

  const visibles = envios.filter((e) => e.digest);

  if (!visibles.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>📥</Text>
        <Text style={styles.emptyText}>No tienes mensajes por ahora</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {visibles.map((e) => {
        const d = e.digest!;
        const respondido = !!e.respondido_at;
        const puedeOcultar = d.tipo === 'mensaje' || respondido;
        return (
          <View key={e.id} style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <Text style={[styles.titulo, { flex: 1 }]}>{d.titulo}</Text>
              {puedeOcultar && (
                <TouchableOpacity onPress={() => ocultar(e.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.cerrarBtn}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
            {d.contenido ? <Text style={styles.contenido}>{d.contenido}</Text> : null}

            {d.tipo === 'satisfaccion' && (
              respondido ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 20, color: '#D4A034' }}>{'★'.repeat(e.respuesta_estrellas ?? 0)}</Text>
                  <Text style={styles.gracias}>¡Gracias por tu respuesta!</Text>
                </View>
              ) : (
                <Estrellas valor={0} onChange={(n) => responderEstrellas(e.id, n)} />
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
                    <TouchableOpacity key={i} disabled={enviando === e.id} onPress={() => responderOpcion(e.id, i)} style={styles.opcionBtn}>
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
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TextInput
                    value={borrador[e.id] ?? ''}
                    onChangeText={(t) => setBorrador((b) => ({ ...b, [e.id]: t }))}
                    placeholder="Tu respuesta..."
                    placeholderTextColor={C.textMuted}
                    style={styles.input}
                  />
                  <TouchableOpacity disabled={enviando === e.id} onPress={() => responderTexto(e.id)} style={styles.enviarBtn}>
                    <Text style={styles.enviarBtnTexto}>Enviar</Text>
                  </TouchableOpacity>
                </View>
              )
            )}

            {d.tipo === 'mensaje' && <Text style={styles.leido}>Leído</Text>}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  center: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 15, color: C.textSoft },

  card: {
    backgroundColor: C.white, borderRadius: 14, padding: 18, gap: 10,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  titulo: { fontSize: 16, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', color: C.text, lineHeight: 22 },
  contenido: { fontSize: 13, color: C.textSoft, lineHeight: 19 },
  gracias: { fontSize: 12, color: C.textSoft },
  respondidoTexto: { fontSize: 13, color: '#2A6A40' },
  leido: { fontSize: 11, color: C.textMuted },
  cerrarBtn: { fontSize: 16, color: C.textMuted, paddingHorizontal: 2 },

  opcionBtn: { padding: 12, borderWidth: 1, borderColor: '#E0D5C8', borderRadius: 8, backgroundColor: C.white },
  opcionTexto: { fontSize: 13, color: C.text },

  input: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#E0D5C8', borderRadius: 8, fontSize: 13, color: C.text },
  enviarBtn: { paddingHorizontal: 16, justifyContent: 'center', backgroundColor: C.accent, borderRadius: 8 },
  enviarBtnTexto: { fontSize: 13, color: 'white', fontWeight: '600' },
});
