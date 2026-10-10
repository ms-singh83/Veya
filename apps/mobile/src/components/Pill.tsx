import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@/theme';

export function Pill({ label }: { label: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  text: { color: colors.textPrimary, fontSize: 14, fontWeight: '500' },
});
