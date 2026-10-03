import { useEffect, useState, type ComponentProps } from 'react';
import { ActivityIndicator, View, type ColorValue } from 'react-native';
import { Redirect, Tabs, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMyRoles, getSession, onAuthChange, pickPrimaryRole } from '@/services/authService';

const LOGIN_ROUTE = '/';

const PRIMARY = '#0B4F4A';
const INACTIVE = '#8A9A98';

type IconName = ComponentProps<typeof Ionicons>['name'];
type GateState = 'loading' | 'allowed' | 'denied';

function tabIcon(filled: IconName, outline: IconName) {
  function TabIcon({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) {
    return <Ionicons name={focused ? filled : outline} size={size} color={color} />;
  }
  return TabIcon;
}

export default function AdminLayout() {
  const [gate, setGate] = useState<GateState>('loading');

  useEffect(() => {
    let active = true;

    async function check() {
      try {
        const session = await getSession();
        if (!session) {
          if (active) setGate('denied');
          return;
        }
        const roles = await getMyRoles(session.user.id);
        if (active) setGate(pickPrimaryRole(roles) === 'administrator' ? 'allowed' : 'denied');
      } catch {
        if (active) setGate('denied');
      }
    }

    check();

    const unsubscribe = onAuthChange((session) => {
      if (!session) {
        setGate('denied');
      } else {
        // defer: do not call Supabase inside the auth callback itself
        setTimeout(check, 0);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  if (gate === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  if (gate === 'denied') {
    return <Redirect href={LOGIN_ROUTE as Href} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PRIMARY,
        tabBarInactiveTintColor: INACTIVE,
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: tabIcon('home', 'home-outline') }} />
      <Tabs.Screen name="map" options={{ title: 'Map', tabBarIcon: tabIcon('map', 'map-outline') }} />
      <Tabs.Screen name="alerts" options={{ title: 'Alerts', tabBarIcon: tabIcon('notifications', 'notifications-outline') }} />
      <Tabs.Screen name="actions" options={{ title: 'Actions', tabBarIcon: tabIcon('clipboard', 'clipboard-outline') }} />
      <Tabs.Screen name="more" options={{ title: 'More', tabBarIcon: tabIcon('ellipsis-horizontal', 'ellipsis-horizontal-outline') }} />

      {/* Reached from other screens, so hidden from the tab bar */}
      <Tabs.Screen name="ward/[id]" options={{ href: null }} />
      <Tabs.Screen name="suggested-actions" options={{ href: null }} />
      <Tabs.Screen name="administration" options={{ href: null }} />
      <Tabs.Screen name="lab-authority" options={{ href: null }} />
    </Tabs>
  );
}
