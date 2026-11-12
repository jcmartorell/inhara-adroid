import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../../constants/colors';
import { F } from '../../constants/fonts';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, focused }: { name: IoniconsName; focused: boolean }) {
  return (
    <Ionicons
      name={focused ? name : ((name + '-outline') as IoniconsName)}
      size={24}
      color={focused ? C.accent : C.textMuted}
    />
  );
}

export default function MaestraLayout() {
  const insets = useSafeAreaInsets();
  const abajo = Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: C.accent,
        tabBarInactiveTintColor: C.textMuted,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: C.border,
          borderTopWidth: 1,
          paddingBottom: abajo,
          paddingTop: 6,
          height: 54 + abajo,
        },
        tabBarLabelStyle: { fontSize: 11, fontFamily: F.medium, marginTop: 2 },
        headerStyle: { backgroundColor: C.bg },
        headerTitleStyle: { fontFamily: F.regular, fontSize: 22, color: C.text },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hoy',
          headerTitle: 'Inhara',
          tabBarIcon: ({ focused }) => <TabIcon name="sunny" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="clases"
        options={{
          title: 'Horario',
          headerTitle: 'Horario del estudio',
          tabBarIcon: ({ focused }) => <TabIcon name="calendar" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="mis-clases"
        options={{
          title: 'Mis clases',
          headerTitle: 'Mis clases',
          tabBarIcon: ({ focused }) => <TabIcon name="person" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="mas"
        options={{
          title: 'Más',
          headerTitle: 'Más',
          tabBarIcon: ({ focused }) => <TabIcon name="ellipsis-horizontal" focused={focused} />,
        }}
      />
      <Tabs.Screen name="clase/[id]" options={{ href: null, title: 'Asistencia', headerTitle: 'Asistencia' }} />
    </Tabs>
  );
}
