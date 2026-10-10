import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing } from '@/theme';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
}

export function Button({ label, onPress, variant = 'primary' }: Props) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        primary ? styles.primary : styles.ghost,
        pressed && { opacity: 0.8 },
      ]}
    >
      <Text style={[styles.label, { color: primary ? colors.orbCore : colors.textPrimary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  primary: { backgroundColor: colors.orbCyan },
  ghost: { borderWidth: 1, borderColor: colors.border },
  label: { fontSize: 16, fontWeight: '600' },
});
