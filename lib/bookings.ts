import { supabase } from './supabase';

const APP_URL = 'https://app.inharayoga.com';

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token ?? ''}` };
}

export async function reservarClase(claseId: string): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(`${APP_URL}/api/bookings`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ claseId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data.error ?? 'No se pudo completar la reservación.' };
  return { ok: true };
}

export async function cancelarReserva(reservaId: string): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(`${APP_URL}/api/bookings`, {
    method: 'DELETE',
    headers: await authHeaders(),
    body: JSON.stringify({ reservaId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data.error ?? 'No se pudo cancelar la reservación.' };
  return { ok: true };
}
