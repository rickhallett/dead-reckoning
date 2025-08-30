import { describe, it, expect } from 'vitest';
import {
  convertAmountToDaily,
  calculateRunwayDays,
  calculateEndDate,
  calculateMinutesPerPenny,
  calculateCashDeltaDays,
  calculateBurnDeltaDays,
  monthlyToDaily,
  dailyToMonthly,
} from './math';

describe('math', () => {
  describe('convertAmountToDaily', () => {
    it('should correctly convert a daily amount', () => {
      expect(convertAmountToDaily(100, 'daily', 30)).toBe(100);
    });

    it('should correctly convert a weekly amount', () => {
      expect(convertAmountToDaily(700, 'weekly', 30)).toBe(100);
    });

    it('should correctly convert a monthly amount with a 30-day basis', () => {
      expect(convertAmountToDaily(3000, 'monthly', 30)).toBe(100);
    });

    it('should correctly convert a monthly amount with a 30.436875-day basis', () => {
      expect(convertAmountToDaily(3044, 'monthly', 30.436875)).toBe(100);
    });

    it('should handle rounding correctly', () => {
      expect(convertAmountToDaily(1000, 'monthly', 30)).toBe(33); // 33.33...
    });
  });

  describe('calculateRunwayDays', () => {
    it('should return null for zero or negative daily burn', () => {
      expect(calculateRunwayDays(10000, 0)).toBeNull();
      expect(calculateRunwayDays(10000, -100)).toBeNull();
    });

    it('should correctly calculate runway days', () => {
      expect(calculateRunwayDays(10000, 100)).toBe(100);
    });

    it('should handle floating point division', () => {
        expect(calculateRunwayDays(10000, 333)).toBeCloseTo(30.03);
    });
  });

  describe('calculateEndDate', () => {
    it('should return null if runway days is null', () => {
      expect(calculateEndDate(null)).toBeNull();
    });

    it('should return a future date string', () => {
        const days = 10;
        const endDate = calculateEndDate(days);
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() + days);
        expect(endDate).toBe(expectedDate.toISOString().split('T')[0]);
    });
  });

    describe('calculateMinutesPerPenny', () => {
        it('should return null for zero or negative daily burn', () => {
            expect(calculateMinutesPerPenny(0)).toBeNull();
            expect(calculateMinutesPerPenny(-100)).toBeNull();
        });

        it('should calculate minutes per penny correctly', () => {
            // 1440 minutes in a day. If you burn 1440 pence, 1 penny = 1 minute.
            expect(calculateMinutesPerPenny(1440)).toBe(1);
        });
    });

    describe('calculateCashDeltaDays', () => {
        it('should calculate the change in runway from a cash delta', () => {
            expect(calculateCashDeltaDays(1000, 100)).toBe(10); // +1000 pence / 100 burn = +10 days
        });
    });

    describe('calculateBurnDeltaDays', () => {
        it('should calculate the change in runway from a daily burn delta', () => {
            const balance = 10000;
            const burn = 100;
            const delta = -10; // Reducing burn by 10
            const originalDays = balance / burn; // 100
            const newDays = balance / (burn + delta); // 10000 / 90 = 111.11...
            expect(calculateBurnDeltaDays(balance, burn, delta)).toBeCloseTo(newDays - originalDays);
        });
    });
});

describe('doubleBind', () => {
  describe('monthlyToDaily', () => {
    it('should convert a monthly amount to a daily amount, rounding to the nearest penny', () => {
      // £100 per month -> £3.29 per day
      expect(monthlyToDaily(10000)).toBe(329);
    });

    it('should handle zero', () => {
      expect(monthlyToDaily(0)).toBe(0);
    });

    it('should handle small numbers', () => {
        // £10 per month -> £0.33 per day
      expect(monthlyToDaily(1000)).toBe(33);
    });
  });

  describe('dailyToMonthly', () => {
    it('should convert a daily amount to a monthly amount, rounding to the nearest penny', () => {
        // £3.29 per day -> £100 per month
      expect(dailyToMonthly(329)).toBe(10000);
    });

    it('should handle zero', () => {
      expect(dailyToMonthly(0)).toBe(0);
    });

    it('should handle small numbers', () => {
        // £0.33 per day -> £10 per month
      expect(dailyToMonthly(33)).toBe(1004); // Note: this won't be a perfect round trip due to rounding
    });

    it('should convert £1 a day to a monthly amount', () => {
        expect(dailyToMonthly(100)).toBe(3044); // ~£30.44
    });
  });
});
