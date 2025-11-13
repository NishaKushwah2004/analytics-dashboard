import { formatCurrency, formatDate } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('formats positive numbers correctly', () => {
      expect(formatCurrency(1000)).toBe('€1,000.00');
    });

    it('formats negative numbers as positive', () => {
      expect(formatCurrency(-500)).toBe('€500.00');
    });
  });

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2025-01-15');
      expect(formatDate(date)).toBe('15.01.2025');
    });
  });
});