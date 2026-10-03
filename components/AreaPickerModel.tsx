import { Ionicons } from '@expo/vector-icons';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { areaSubtitle, areaTitle } from '@/lib/format';
import type { Area } from '@/types/cell';

interface Props {
  visible: boolean;
  areas: Area[];
  selectedId: number | null;
  onSelect: (areaId: number) => void;
  onClose: () => void;
}

export function AreaPickerModal({ visible, areas, selectedId, onSelect, onClose }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.handle} />
        <Text style={styles.title}>Choose your area</Text>
        <FlatList
          data={areas}
          keyExtractor={(a) => String(a.id)}
          renderItem={({ item }) => {
            const selected = item.id === selectedId;
            return (
              <Pressable
                style={[styles.row, selected && styles.rowSelected]}
                onPress={() => {
                  onSelect(item.id);
                  onClose();
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{areaTitle(item)}</Text>
                  <Text style={styles.rowSub}>{areaSubtitle(item)}</Text>
                </View>
                {selected ? <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} /> : null}
              </Pressable>
            );
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    maxHeight: '70%',
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: theme.colors.border, marginBottom: 14 },
  title: { fontFamily: theme.fonts.heading, fontSize: 22, fontWeight: '700', color: theme.colors.primary, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12, borderRadius: theme.radius.small },
  rowSelected: { backgroundColor: theme.colors.mint },
  rowTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
  rowSub: { fontSize: 13, color: theme.colors.muted, marginTop: 2 },
});
