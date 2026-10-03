import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Page } from '@/components/ui';
import { theme } from '@/constants/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

const OPTIONS: { title: string; text: string; icon: IconName; href: string }[] = [
  { title: 'I am a citizen', text: 'See disease activity and alerts near you.', icon: 'people-outline', href: '/signup' },
  { title: 'I work in a lab', text: 'Submit aggregated case counts.', icon: 'flask-outline', href: '/lab_assistant/login' },
  { title: 'Health authority', text: 'Monitor risk, manage alerts and labs.', icon: 'shield-checkmark-outline', href: '/login?role=administrator' },
];

export function RoleOptions() {
  const router = useRouter();
  return (
    <Page title="How will you use HealthPulse?" back>
      <View style={{ gap: 14 }}>
        {OPTIONS.map((o) => (
          <Pressable key={o.title} style={styles.card} onPress={() => router.push(o.href as never)}>
            <View style={styles.icon}>
              <Ionicons name={o.icon} size={26} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{o.title}</Text>
              <Text style={styles.text}>{o.text}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.muted} />
          </Pressable>
        ))}
      </View>
      <Pressable onPress={() => router.push('/login')} hitSlop={10}>
        <Text style={styles.login}>Already have an account? Log in</Text>
      </Pressable>
    </Page>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
  },
  icon: { width: 52, height: 52, borderRadius: 26, backgroundColor: theme.colors.mint, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: theme.fonts.heading, fontSize: 19, fontWeight: '700', color: theme.colors.primary },
  text: { fontSize: 14, color: theme.colors.muted, marginTop: 2 },
  login: { textAlign: 'center', color: theme.colors.primary, fontWeight: '600', fontSize: 15, marginTop: 8 },
});
