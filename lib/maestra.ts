import { supabase } from './supabase';

const APP_URL = 'https://app.inharayoga.com';

export interface MaestraInfo {
  id: string;
  nombre: string | null;
  puede_asistencias: boolean | null;
}

export interface ClaseM {
  id: string;
  titulo: string;
  fecha: string;
  hora: string;
  hora_fin: string;
  capacidad: number;
  spots_disponibles: number | null;
  ubicacion: string | null;
  maestra_id?: string | null;
}

export interface ReservaM {
  id: string;
  user_id: string;
  estado: string;
  nombre: string;
  numero_alumno: string | null;
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function sumarDias(fecha: string, n: number): string {
  const [y, m, d] = fecha.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
}

export function etiquetaDia(fecha: string, hoy: string): string {
  if (fecha === hoy) return 'Hoy';
  if (fecha === sumarDias(hoy, 1)) return 'Mañana';
  const d = new Date(fecha + 'T12:00:00');
  return `${DIAS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]}`;
}

export const hhmm = (h: string | null | undefined) => (h ?? '').slice(0, 5);

export function reservadas(c: ClaseM): number {
  const cap = c.capacidad ?? 0;
  return Math.max(0, cap - (c.spots_disponibles ?? cap));
}

export async function cargarMaestra(): Promise<MaestraInfo | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;
  const { data } = await supabase
    .from('maestras')
    .select('id,nombre,puede_asistencias')
    .eq('email', user.email)
    .maybeSingle();
  return (data as MaestraInfo | null) ?? null;
}

const CAMPOS_CLASE = 'id,titulo,fecha,hora,hora_fin,capacidad,spots_disponibles,ubicacion,maestra_id';

export async function clasesDeMaestra(maestraId: string, desde: string, hasta: string): Promise<ClaseM[]> {
  const { data, error } = await supabase
    .from('clases')
    .select(CAMPOS_CLASE)
    .eq('maestra_id', maestraId)
    .gte('fecha', desde)
    .lte('fecha', hasta)
    .order('fecha')
    .order('hora');
  if (error) throw error;
  return (data ?? []) as ClaseM[];
}

// Calendario completo del estudio (todas las maestras) + nombres de maestras.
export async function todasLasClases(desde: string, hasta: string): Promise<{ clases: ClaseM[]; nombres: Record<string, string> }> {
  const { data, error } = await supabase
    .from('clases')
    .select(CAMPOS_CLASE)
    .gte('fecha', desde)
    .lte('fecha', hasta)
    .order('fecha')
    .order('hora');
  if (error) throw error;
  const { data: ms } = await supabase.from('maestras').select('id,nombre');
  const nombres: Record<string, string> = {};
  (ms ?? []).forEach((m: any) => { nombres[m.id] = m.nombre; });
  return { clases: (data ?? []) as ClaseM[], nombres };
}

export async function claseConReservas(claseId: string): Promise<{ clase: ClaseM | null; reservas: ReservaM[] }> {
  const { data: clase } = await supabase.from('clases').select(CAMPOS_CLASE).eq('id', claseId).maybeSingle();
  const { data: res, error } = await supabase
    .from('reservas')
    .select('id,user_id,estado,created_at')
    .eq('clase_id', claseId)
    .neq('estado', 'cancelada')
    .order('created_at');
  if (error) throw error;

  const ids = Array.from(new Set((res ?? []).map((r: any) => r.user_id)));
  const perfiles: Record<string, any> = {};
  if (ids.length > 0) {
    const { data: ps } = await supabase.from('profiles').select('id,nombre,numero_alumno').in('id', ids);
    (ps ?? []).forEach((p: any) => { perfiles[p.id] = p; });
  }

  return {
    clase: (clase as ClaseM | null) ?? null,
    reservas: (res ?? []).map((r: any) => ({
      id: r.id,
      user_id: r.user_id,
      estado: r.estado,
      nombre: perfiles[r.user_id]?.nombre ?? 'Alumna',
      numero_alumno: perfiles[r.user_id]?.numero_alumno ?? null,
    })),
  };
}

// Marca asistencia vía API (no toca créditos). El servidor valida que sea la maestra de la clase.
export async function marcarAsistencia(reservaId: string, estado: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${APP_URL}/api/reservas/asistencia`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token ?? ''}` },
      body: JSON.stringify({ reservaId, estado }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.error ?? 'No se pudo guardar la asistencia.' };
    return { ok: true };
  } catch {
    return { ok: false, error: 'No se pudo conectar. Revisa tu internet e intenta de nuevo.' };
  }
}

export interface EstadisticasM {
  totalClases: number;
  clasesMes: number;
  alumnosMes: number;
  meses: { label: string; count: number }[];
}

// Igual que la web: clases ya impartidas (fecha <= hoy) y asistencias registradas.
export async function estadisticasMaestra(maestraId: string, hoy: string): Promise<EstadisticasM> {
  const [y, m] = hoy.split('-').map(Number);
  const inicioMes = `${y}-${String(m).padStart(2, '0')}-01`;

  const { data: cl, error } = await supabase
    .from('clases')
    .select('id,fecha')
    .eq('maestra_id', maestraId)
    .lte('fecha', hoy);
  if (error) throw error;
  const clases = (cl ?? []) as { id: string; fecha: string }[];

  // Ventana de 6 meses (mes actual y 5 anteriores)
  const ventana: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(y, m - 1 - i, 1));
    ventana.push({ key: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`, label: MESES[d.getUTCMonth()] });
  }
  const desde = ventana[0].key + '-01';
  const enVentana = clases.filter((c) => c.fecha >= desde);
  const mesDeClase: Record<string, string> = {};
  enVentana.forEach((c) => { mesDeClase[c.id] = c.fecha.slice(0, 7); });

  const porMes: Record<string, number> = {};
  const ids = enVentana.map((c) => c.id);
  for (let i = 0; i < ids.length; i += 50) {
    const { data: as } = await supabase.from('asistencias').select('clase_id').in('clase_id', ids.slice(i, i + 50)).limit(5000);
    (as ?? []).forEach((a: any) => {
      const k = mesDeClase[a.clase_id];
      if (k) porMes[k] = (porMes[k] ?? 0) + 1;
    });
  }

  const mesKey = inicioMes.slice(0, 7);
  return {
    totalClases: clases.length,
    clasesMes: clases.filter((c) => c.fecha >= inicioMes).length,
    alumnosMes: porMes[mesKey] ?? 0,
    meses: ventana.map((v) => ({ label: v.label, count: porMes[v.key] ?? 0 })),
  };
}
