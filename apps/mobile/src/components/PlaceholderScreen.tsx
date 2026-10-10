import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, type } from '@/theme';
import { VeyaOrb } from './VeyaOrb';

interface Props {
  title: string;
  description: string;
  /** Build-plan day when this screen gets implemented. */
  day: number;
}

export function PlaceholderScreen({ title, description, day }: Props) {
  return (
    <View style={styles.container}>
      <VeyaOrb size={72} animated={false} />
      <Text style={[type.heading, styles.title]}>{title}</Text>
      <Text style={[type.body, styles.description]}>{description}</Text>
      <Text style={type.caption}>Coming in build plan day {day}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: { marginTop: spacing.md },
  description: { color: colors.textSecondary, textAlign: 'center' },
});
