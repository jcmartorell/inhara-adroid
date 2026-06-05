import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { C } from '../../constants/colors';
import type { Plan, Suscripcion } from '../../lib/models';

const BANCO = {
  banco: 'BBVA',
  titular: 'Inhara Yoga Studio',
  cuenta: '1579356506',
  clabe: '012 760 01579356506 5',
  whatsapp: '526621575950',
};

function pad2(n: number) { return String(n).padStart(2, '0'); }

function makeRef(planNombre: string) {
  const d = new Date();
  return `INHARA-${planNombre.toUpperCase().replace(/ /g, '-')}-${d.getFullYear()}${pad2(d.getMonth() + 1)}`;
}

function makeFechaFin(duracionDias: number | null) {
  const d = new Date();
  d.setDate(d.getDate() + (duracionDias ?? 30));
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function fechaHoy() {
  const d = new Date();
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export default function PaquetesScreen() {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [susActiva, setSusActiva] = useState<Suscripcion | null>(null);
  const [planActivoNombre, setPlanActivoNombre] = useState('');
  const [seleccionado, setSeleccionado] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const [{ data: planesList }, { data: sus }] = await Promise.all([
      supabase.from('planes').select('*').eq('activo', true).order('orden'),
      supabase.from('suscripciones').select('*').eq('user_id', session.user.id).eq('estado', 'activo').limit(1),
    ]);

    setPlanes(planesList ?? []);
    const susData = sus?.[0] ?? null;
    setSusActiva(susData);

    if (susData?.plan_id) {
      const { data: p } = await supabase.from('planes').select('nombre').eq('id', susData.plan_id).limit(1);
      setPlanActivoNombre(p?.[0]?.nombre ?? '');
    }
    setLoading(false);
  }

  function openWhatsApp(plan: Plan) {
    const ref = makeRef(plan.nombre);
    const msg = encodeURIComponent(`Hola, hice una transferencia para el paquete ${plan.nombre} Referencia: ${ref}`);
    Linking.openURL(`https://wa.me/${BANCO.whatsapp}?text=${msg}`);
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={C.accent} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Plan activo banner */}
      {planActivoNombre ? (
        <View style={styles.activoBanner}>
          <Text style={styles.activoIcon}>📦</Text>
          <View>
            <Text style={styles.activoNombre}>Plan activo: {planActivoNombre}</Text>
            <Text style={styles.activoClases}>
              {susActiva?.ilimitado ? 'Clases ilimitadas' : `${susActiva?.clases_restantes ?? 0} clases restantes`}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Lista de planes */}
      {planes.map((plan) => {
        const isPremium = !!plan.ilimitado;
        const isSelected = seleccionado?.id === plan.id;

        return (
          <TouchableOpacity
            key={plan.id}
            style={[styles.planCard, isPremium && styles.planCardPremium, isSelected && styles.planCardSelected]}
            onPress={() => setSeleccionado(isSelected ? null : plan)}
            activeOpacity={0.85}
          >
            {/* Header del plan */}
            <View style={styles.planHeader}>
              <View>
                <Text style={[styles.planNombre, isPremium && styles.planNombrePremium]}>{plan.nombre}</Text>
                <Text style={[styles.planClases, isPremium && styles.planClasesPremium]}>
                  {isPremium ? 'Clases ilimitadas' : `${plan.clases_por_mes ?? 0} clases`}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.planPrecio, isPremium && styles.planPrecioPremium]}>
                  ${plan.precio.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                </Text>
                <Text style={[styles.planDuracion, isPremium && styles.planDuracionPremium]}>
                  {plan.duracion_dias ? `${plan.duracion_dias} días` : 'por mes'}
                </Text>
              </View>
            </View>

            {/* Instrucciones expandidas */}
            {isSelected && (
              <View>
                <View style={[styles.divider, isPremium && styles.dividerPremium]} />
                <View style={styles.instrucciones}>
                  <Text style={[styles.instruccionesTitulo, isPremium && styles.textPremium]}>
                    Instrucciones de pago
                  </Text>

                  {[
                    ['Banco', BANCO.banco],
                    ['Titular', BANCO.titular],
                    ['No. de cuenta', BANCO.cuenta],
                    ['CLABE', BANCO.clabe],
                    ['Monto', `$${plan.precio.toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN`],
                    ['Referencia', makeRef(plan.nombre)],
                    ['Vigencia', `${fechaHoy()} — ${makeFechaFin(plan.duracion_dias)}`],
                  ].map(([key, val]) => (
                    <View key={key} style={styles.fila}>
                      <Text style={[styles.filaKey, isPremium && styles.filaKeyPremium]}>{key}</Text>
                      <Text style={[styles.filaVal, isPremium && styles.textPremium, key === 'Monto' && !isPremium && styles.filaValAccent]}>
                        {val}
                      </Text>
                    </View>
                  ))}

                  <TouchableOpacity style={styles.waBtn} onPress={() => openWhatsApp(plan)} activeOpacity={0.85}>
                    <Text style={styles.waBtnText}>📱 Enviar comprobante por WhatsApp</Text>
                  </TouchableOpacity>

                  <Text style={[styles.nota, isPremium && styles.notaPremium]}>
                    Una vez confirmado tu pago, tu plan se activará en menos de 24 horas.
                  </Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  loadingContainer: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },

  activoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFF7EE',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EDD5B0',
  },
  activoIcon: { fontSize: 20 },
  activoNombre: { fontSize: 14, fontWeight: '600', color: C.text },
  activoClases: { fontSize: 12, color: C.textSoft },

  planCard: {
    backgroundColor: C.white,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  planCardPremium: { backgroundColor: C.brown },
  planCardSelected: {
    borderWidth: 2,
    borderColor: C.accent,
  },

  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
  },
  planNombre: {
    fontSize: 20,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: C.text,
  },
  planNombrePremium: { color: C.gold },
  planClases: { fontSize: 12, color: C.textSoft, marginTop: 2 },
  planClasesPremium: { color: C.gold + '99' },
  planPrecio: {
    fontSize: 26,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: C.accent,
  },
  planPrecioPremium: { color: C.gold },
  planDuracion: { fontSize: 11, color: C.textSoft },
  planDuracionPremium: { color: C.gold + '66' },

  divider: { height: 1, backgroundColor: C.border, marginHorizontal: 18 },
  dividerPremium: { backgroundColor: 'rgba(255,255,255,0.15)' },

  instrucciones: { padding: 18, gap: 10 },
  instruccionesTitulo: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: C.text,
    marginBottom: 4,
  },
  textPremium: { color: C.gold },

  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: C.border + '66' },
  filaKey: { fontSize: 12, color: C.textSoft },
  filaKeyPremium: { color: C.gold + '88' },
  filaVal: { fontSize: 13, fontWeight: '600', color: C.text, maxWidth: '60%', textAlign: 'right' },
  filaValAccent: { color: C.accent },

  waBtn: {
    backgroundColor: '#0E7A1A',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  waBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },

  nota: { fontSize: 11, color: C.textMuted, lineHeight: 16 },
  notaPremium: { color: C.gold + '66' },
});
