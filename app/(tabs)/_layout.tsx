import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../../constants/colors';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, focused }: { name: IoniconsName; focused: boolean }) {
  return (
    <Ionicons
      name={focused ? name : (name + '-outline') as IoniconsName}
      size={24}
      color={focused ? C.accent : C.textMuted}
    />
  );
}

export default function TabsLayout() {
  // Altura fija (62) hacía que en Androids con botones/gestos de navegación el sistema
  // tapara los íconos y etiquetas: se suma el área segura inferior del dispositivo.
  const insets = useSafeAreaInsets();
  const abajo = Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: C.accent,
        tabBarInactiveTintColor: C.textMuted,
        tabBarStyle: {
          backgroundColor: '#FEFCF9',
          borderTopColor: C.border,
          borderTopWidth: 1,
          paddingBottom: abajo,
          paddingTop: 6,
          height: 54 + abajo,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500', marginTop: 2 },
        headerStyle: { backgroundColor: C.bg },
        headerTitleStyle: {
          fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
          fontSize: 22,
          color: C.text,
          fontWeight: '400' as const,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
          headerTitle: 'Inhara',
        }}
      />
      <Tabs.Screen
        name="clases"
        options={{
          title: 'Clases',
          tabBarIcon: ({ focused }) => <TabIcon name="calendar" focused={focused} />,
          headerTitle: 'Clases',
        }}
      />
      <Tabs.Screen
        name="paquetes"
        options={{
          title: 'Comprar',
          tabBarIcon: ({ focused }) => <TabIcon name="bag" focused={focused} />,
          headerTitle: 'Paquetes',
        }}
      />
      <Tabs.Screen
        name="mas"
        options={{
          title: 'Más',
          tabBarIcon: ({ focused }) => (
            <Ionicons name="ellipsis-horizontal" size={24} color={focused ? C.accent : C.textMuted} />
          ),
          headerTitle: 'Más',
        }}
      />
    </Tabs>
  );
}
