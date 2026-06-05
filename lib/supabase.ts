import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://timergdgaxmfallounry.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpbWVyZ2RnYXhtZmFsbG91bnJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1OTU5MzIsImV4cCI6MjA4ODE3MTkzMn0.3VjZeD346sb9maYr2mlHG0eLYDvuObNi8rwazQzvuhs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
