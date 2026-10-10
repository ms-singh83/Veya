import { COLORS } from '@veya/shared';

export const colors = COLORS;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

export const radius = { sm: 8, md: 14, lg: 22, xl: 28, pill: 999 } as const;

export const type = {
  wordmark: { fontSize: 40, fontWeight: '700', letterSpacing: -0.5, color: colors.textPrimary },
  title: { fontSize: 28, fontWeight: '700', color: colors.textPrimary },
  heading: { fontSize: 20, fontWeight: '600', color: colors.textPrimary },
  body: { fontSize: 16, fontWeight: '400', color: colors.textPrimary },
  tagline: { fontSize: 18, fontWeight: '400', color: colors.textSecondary },
  caption: { fontSize: 13, fontWeight: '500', color: colors.textMuted },
} as const;
