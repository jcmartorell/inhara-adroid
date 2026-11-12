import { Alert, Platform } from 'react-native';

// Alert.alert de react-native-web es un no-op (no muestra nada ni llama los
// onPress) — sin esto, cualquier confirmación/aviso probado en Expo Web
// (localhost) parece "no hacer nada" al tocar el botón.

export function confirmar(titulo: string, mensaje: string, textoConfirmar = 'Sí, cancelar'): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(`${titulo}\n\n${mensaje}`));
  }
  return new Promise((resolve) => {
    Alert.alert(titulo, mensaje, [
      { text: 'No', style: 'cancel', onPress: () => resolve(false) },
      { text: textoConfirmar, style: 'destructive', onPress: () => resolve(true) },
    ], { cancelable: true, onDismiss: () => resolve(false) });
  });
}

export function avisar(titulo: string, mensaje: string) {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensaje}`);
    return;
  }
  Alert.alert(titulo, mensaje);
}
