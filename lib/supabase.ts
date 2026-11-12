import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://timergdgaxmfallounry.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpbWVyZ2RnYXhtZmFsbG91bnJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1OTU5MzIsImV4cCI6MjA4ODE3MTkzMn0.3VjZeD346sb9maYr2mlHG0eLYDvuObNi8rwazQzvuhs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Cliente sin sesión persistente ni listeners: sirve para verificar el código de
// recuperación y cambiar la contraseña SIN que la app entre a la sesión a medias.
export function crearClienteEfimero() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
