import { supabase } from './supabase';

const APP_URL = 'https://app.inharayoga.com';

export interface Digest {
  id: string;
  tipo: 'mensaje' | 'pregunta' | 'encuesta' | 'satisfaccion';
  titulo: string;
  contenido: string | null;
  opciones: string[] | null;
}

export interface Envio {
  id: string;
  digest: Digest;
  leido: boolean;
  respuesta_estrellas: number | null;
  respuesta_opcion: number | null;
  respuesta_texto: string | null;
  respondido_at: string | null;
}

async function headers() {
  const { data: { session } } = await supabase.auth.getSession();
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token ?? ''}` };
}

// Los mensajes se leen/contestan por la API del servidor: la política RLS de "digests"
// no deja que la alumna lea el mensaje directo desde la base de datos.
export async function cargarEnvios(): Promise<{ envios: Envio[]; error?: string }> {
  try {
    const res = await fetch(`${APP_URL}/api/mensajes`, { headers: await headers() });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { envios: [], error: data.error ?? 'No se pudieron cargar los mensajes' };
    return { envios: data.envios ?? [] };
  } catch {
    return { envios: [], error: 'No se pudo conectar. Revisa tu internet e intenta de nuevo.' };
  }
}

async function accion(body: Record<string, any>): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${APP_URL}/api/mensajes`, { method: 'POST', headers: await headers(), body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, error: data.error };
  } catch {
    return { ok: false, error: 'No se pudo conectar. Revisa tu internet e intenta de nuevo.' };
  }
}

export const marcarLeidos = () => accion({ accion: 'leer' });
export const responder = (envioId: string, datos: { estrellas?: number; opcion?: number; texto?: string }) =>
  accion({ accion: 'responder', envioId, ...datos });
export const ocultar = (envioId: string) => accion({ accion: 'ocultar', envioId });

// Cuántos mensajes requieren atención (sin leer, o preguntas/encuestas sin contestar).
export function resumen(envios: Envio[]) {
  const sinLeer = envios.filter((e) => !e.leido).length;
  const porContestar = envios.filter((e) => e.digest.tipo !== 'mensaje' && !e.respondido_at).length;
  return { sinLeer, porContestar, total: Math.max(sinLeer, porContestar) };
}
