import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { C } from '../../constants/colors';

const APP_URL = 'https://app.inharayoga.com';

export default function LoginScreen() {
  const [modo, setModo] = useState<'login' | 'recuperar'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recuperarEnviado, setRecuperarEnviado] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError('Ingresa correo y contraseña');
      return;
    }
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (err) setError('Correo o contraseña incorrectos');
    setLoading(false);
  }

  async function handleRecuperar() {
    if (!email.trim()) {
      setError('Ingresa tu correo');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${APP_URL}/api/auth/recuperar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'No se pudo enviar el correo');
      } else {
        setRecuperarEnviado(true);
      }
    } catch {
      setError('No se pudo enviar el correo. Revisa tu conexión.');
    }
    setLoading(false);
  }

  function volverALogin() {
    setModo('login');
    setError('');
    setRecuperarEnviado(false);
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.logoBlock}>
          <Text style={styles.logoText}>INHARA</Text>
          <Text style={styles.logoSub}>YOGA STUDIO</Text>
        </View>

        {modo === 'recuperar' ? (
          <View style={styles.form}>
            {recuperarEnviado ? (
              <>
                <Text style={styles.infoText}>
                  Si {email.trim()} tiene una cuenta, te enviamos un link para crear una nueva contraseña.
                </Text>
                <TouchableOpacity onPress={volverALogin} activeOpacity={0.7}>
                  <Text style={styles.linkText}>← Volver a iniciar sesión</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.field}>
                  <Text style={styles.label}>CORREO</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor="rgba(255,255,255,0.3)"
                  />
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TouchableOpacity style={styles.btn} onPress={handleRecuperar} disabled={loading} activeOpacity={0.85}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Enviar link</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={volverALogin} activeOpacity={0.7}>
                  <Text style={styles.linkText}>← Volver a iniciar sesión</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>CORREO</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder=""
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>CONTRASEÑA</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder=""
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Entrar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { setModo('recuperar'); setError(''); }} activeOpacity={0.7}>
              <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => Linking.openURL(`${APP_URL}/auth/registro`)} activeOpacity={0.7}>
              <Text style={styles.linkText}>¿No tienes cuenta? Crear cuenta</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.brown },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 48 },
  logoBlock: { alignItems: 'center', marginBottom: 52 },
  logoText: {
    fontSize: 42,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '300',
    color: C.gold,
    letterSpacing: 4,
  },
  logoSub: {
    fontSize: 11,
    fontWeight: '300',
    letterSpacing: 6,
    color: C.gold + '99',
    marginTop: 4,
  },
  form: { gap: 16 },
  field: { gap: 6 },
  label: { fontSize: 10, fontWeight: '500', letterSpacing: 1.5, color: C.gold + '99' },
  input: {
    color: '#fff',
    fontSize: 15,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  errorText: { fontSize: 13, color: '#FFAAAA', textAlign: 'center' },
  infoText: { fontSize: 14, color: C.gold, textAlign: 'center', lineHeight: 20 },
  linkText: { fontSize: 13, color: C.gold + 'CC', textAlign: 'center', marginTop: 4 },
  btn: {
    height: 50,
    backgroundColor: C.accent,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  btnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
