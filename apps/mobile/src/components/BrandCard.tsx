import { StyleSheet, Text, View } from 'react-native';
import { BRAND } from '@veya/shared';
import { colors, radius, spacing, type } from '@/theme';
import { Pill } from './Pill';
import { VeyaOrb } from './VeyaOrb';

/** Orb tile, wordmark, tagline and brand pillars — the Veya identity block. */
export function BrandCard() {
  return (
    <View style={styles.card}>
      <View style={styles.tile}>
        <VeyaOrb size={96} />
      </View>
      <Text style={[type.wordmark, styles.wordmark]}>{BRAND.wordmark}</Text>
      <Text style={[type.tagline, styles.tagline]}>{BRAND.tagline}</Text>
      <View style={styles.pills}>
        {BRAND.pillars.map((p) => (
          <Pill key={p} label={p} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  tile: {
    width: 132,
    height: 132,
    borderRadius: radius.lg,
    backgroundColor: colors.iconTile,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: { marginTop: spacing.xl },
  tagline: { marginTop: spacing.md, textAlign: 'center' },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
});
