/**
 * Veya brand constants shared by the mobile app, API responses and notification copy.
 */
export const BRAND = {
  name: 'Veya',
  wordmark: 'veya',
  tagline: 'Your everyday wellness, intelligently cared for.',
  pillars: ['Personal', 'Proactive', 'AI-powered'],
} as const;

/** Dark-first palette taken from the Veya orb mark. */
export const COLORS = {
  background: '#0A0D14',
  surface: '#151A28',
  surfaceRaised: '#1E2434',
  border: '#262D3F',
  iconTile: '#000000',
  textPrimary: '#FFFFFF',
  textSecondary: '#A9B1C3',
  textMuted: '#6B7489',
  orbCyan: '#6FF3F7',
  orbTeal: '#2EC4D6',
  orbBlue: '#1E5BFF',
  orbIndigo: '#1A2A9C',
  orbCore: '#04060C',
  success: '#3DDC97',
  warning: '#F5B451',
  danger: '#FF6B6B',
} as const;

export type ColorToken = keyof typeof COLORS;
