import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C } from '@/theme/admin';

type Props = {
  email?: string | null;
  area?: string;
  onAdministration: () => void;
  onLogout: () => void;
};

export default function MoreView({ email, area, onAdministration, onLogout }: Props) {
  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <ScrollView contentContainerStyle={s.pad}>
        <Text style={s.title}>More</Text>

        <View style={s.profile}>
          <View style={s.avatar}>
            <Ionicons name="business-outline" size={26} color={C.teal} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.role}>City Administrator</Text>
            <Text style={s.sub}>{area ?? 'Solapur City, Maharashtra'}</Text>
            {email ? <Text style={s.sub}>{email}</Text> : null}
          </View>
        </View>

        <Pressable onPress={onAdministration} style={s.item}>
          <View style={s.itemIcon}>
            <Ionicons name="settings-outline" size={22} color={C.teal} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.itemTitle}>Administration</Text>
            <Text style={s.sub}>Manage users, labs and settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={C.muted} />
        </Pressable>

        <Pressable onPress={onLogout} style={[s.item, s.logout]}>
          <View style={[s.itemIcon, { backgroundColor: '#FBE5E2' }]}>
            <Ionicons name="log-out-outline" size={22} color={C.high} />
          </View>
          <Text style={[s.itemTitle, { color: C.high, flex: 1 }]}>Logout</Text>
        </Pressable>

        <Text style={s.foot}>Protected government system. Authorized access only.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  pad: { padding: 20, gap: 14 },
  title: { fontSize: 28, fontWeight: '700', color: C.ink },
  sub: { color: C.muted, fontSize: 13, marginTop: 2 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.card, borderRadius: 20, borderWidth: 1, borderColor: C.line, padding: 16 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center' },
  role: { color: C.ink, fontSize: 17, fontWeight: '700' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.line, padding: 14 },
  itemIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center' },
  itemTitle: { color: C.ink, fontSize: 16, fontWeight: '700' },
  logout: { borderColor: '#F1C9C4' },
  foot: { color: C.muted, fontSize: 12, textAlign: 'center', marginTop: 20 },
});
