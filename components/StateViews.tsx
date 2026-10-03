import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';

export function LoadingView() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Could not load data</Text>
      <Text style={styles.text}>
        Check your internet connection and make sure you are signed in, then try again.
      </Text>
      {message ? <Text style={styles.detail}>{message}</Text> : null}
      {onRetry ? (
        <Pressable style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function EmptyView({ title, text }: { title: string; text?: string }) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>{title}</Text>
      {text ? <Text style={styles.text}>{text}</Text> : null}
    </View>
  );
}

/** Shown when EXPO_PUBLIC_USE_MOCK=true so sample numbers are never mistaken for real data. */
export function MockBanner() {
  return (
    <View style={styles.mock}>
      <Text style={styles.mockText}>Showing sample data</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
  title: { fontFamily: theme.fonts.heading, fontSize: 22, fontWeight: '700', color: theme.colors.primary, textAlign: 'center' },
  text: { fontSize: 15, lineHeight: 22, color: theme.colors.muted, textAlign: 'center' },
  detail: { fontSize: 12, color: theme.colors.muted, textAlign: 'center' },
  button: { marginTop: 8, backgroundColor: theme.colors.primary, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  buttonText: { color: theme.colors.primaryText, fontWeight: '700', fontSize: 15 },
  mock: { alignSelf: 'center', backgroundColor: theme.colors.amber, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  mockText: { fontSize: 12, fontWeight: '600', color: theme.colors.amberText },
});
