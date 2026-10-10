import { describe, expect, it } from 'vitest';
import { BRAND, COLORS } from './brand';

describe('brand', () => {
  it('exposes the Veya identity', () => {
    expect(BRAND.name).toBe('Veya');
    expect(BRAND.pillars).toEqual(['Personal', 'Proactive', 'AI-powered']);
  });

  it('uses valid hex colors', () => {
    for (const value of Object.values(COLORS)) {
      expect(value).toMatch(/^#[0-9A-F]{6}$/);
    }
  });
});
