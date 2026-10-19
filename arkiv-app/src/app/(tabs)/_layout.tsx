import { router } from 'expo-router';
import { Tabs, type BottomTabBarProps } from 'expo-router/tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '../../components/Icon';
import { useStore } from '../../store';
import { C } from '../../theme';

const TABS: { name: string; label: string; icon: IconName }[] = [
  { name: 'index', label: 'Hem', icon: 'home' },
  { name: 'explore', label: 'Utforska', icon: 'search' },
  { name: 'create', label: 'Skapa', icon: 'plus' },
  { name: 'messages', label: 'Meddelanden', icon: 'chat' },
  { name: 'profile', label: 'Profil', icon: 'user' },
];

function TabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { state: s } = useStore();
  const unread = s.threads.some((t) => t.unread && !s.blocked[t.with]);
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {state.routes.map((route, i) => {
        const tab = TABS.find((t) => t.name === route.name);
        if (!tab) return null;
        const active = state.index === i;
        const color = active ? C.ink : C.muted;
        return (
          <Pressable
            key={route.key}
            style={styles.tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.label}
            onPress={() => {
              if (tab.name === 'create') { router.push('/camera'); return; }
              const e = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!active && !e.defaultPrevented) navigateToTab(route.key);
            }}
          >
            {tab.name === 'messages' && unread ? <View style={styles.dot} /> : null}
            <Icon name={tab.icon} size={20} color={color} />
            <Text style={[styles.label, { color }, active && { fontWeight: '600' }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(p) => <TabBar {...p} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: C.bg } }}>
      {TABS.map((t) => <Tabs.Screen key={t.name} name={t.name} />)}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.bg, paddingTop: 10, paddingHorizontal: 6 },
  tab: { flex: 1, alignItems: 'center', gap: 6 },
  label: { fontSize: 12, color: C.muted },
  dot: { position: 'absolute', top: -6, width: 7, height: 7, borderRadius: 4, backgroundColor: C.accent },
});
