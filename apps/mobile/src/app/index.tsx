import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandCard } from '@/components/BrandCard';
import { Button } from '@/components/Button';
import { colors, spacing, type } from '@/theme';

/** Welcome screen. Sign-up / sign-in arrive on Day 3, onboarding on Day 5. */
export default function Welcome() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <BrandCard />
      </View>
      <View style={styles.actions}>
        <Button label="Get started" onPress={() => router.replace('/today')} />
        <Button
          label="I already have an account"
          variant="ghost"
          onPress={() => router.replace('/today')}
        />
        <Text style={[type.caption, styles.disclaimer]}>
          Veya offers general wellness guidance, not medical advice.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.lg },
  actions: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.md },
  disclaimer: { textAlign: 'center' },
});
