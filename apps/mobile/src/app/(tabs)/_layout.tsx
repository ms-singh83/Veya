import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router/js-tabs';
import type { ComponentProps } from 'react';
import { colors } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: 'today', title: 'Today', icon: 'sunny-outline' },
  { name: 'food', title: 'Food', icon: 'restaurant-outline' },
  { name: 'activity', title: 'Activity', icon: 'walk-outline' },
  { name: 'insights', title: 'Insights', icon: 'stats-chart-outline' },
  { name: 'chat', title: 'Chat', icon: 'chatbubble-ellipses-outline' },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.orbCyan,
        tabBarInactiveTintColor: colors.textMuted,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ color, size }) => <Ionicons name={t.icon} color={color} size={size} />,
          }}
        />
      ))}
    </Tabs>
  );
}
