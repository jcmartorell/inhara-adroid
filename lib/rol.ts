import { supabase } from './supabase';

// Valores de profiles.rol que dan acceso al modo maestra.
export function esMaestra(rol: string | null | undefined) {
  const r = (rol ?? '').toLowerCase();
  return r === 'maestra' || r === 'maestro' || r === 'instructora' || r === 'instructor' || r === 'teacher';
}

export async function cargarPerfilBasico(userId: string) {
  const { data } = await supabase.from('profiles').select('rol,nombre').eq('id', userId).maybeSingle();
  let rol = (data?.rol ?? null) as string | null;

  // Admin que además es maestra activa: la app abre el modo maestra (el rol en el CRM no cambia).
  if ((rol ?? '').toLowerCase() === 'admin') {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      const { data: m } = await supabase.from('maestras').select('id').eq('email', user.email).eq('activa', true).maybeSingle();
      if (m) rol = 'maestra';
    }
  }
  return { rol, nombre: (data?.nombre ?? null) as string | null };
}
