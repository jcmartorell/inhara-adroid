import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: C.accent,
        tabBarInactiveTintColor: C.textMuted,
        tabBarStyle: {
          backgroundColor: '#FEFCF9',
          borderTopColor: C.border,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 22 : 8,
          paddingTop: 6,
          height: Platform.OS === 'ios' ? 82 : 62,
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
