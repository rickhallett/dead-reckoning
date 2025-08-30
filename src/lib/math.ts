import type { Frequency } from './types';

export function convertAmountToDaily(
  amount: number,
  frequency: Frequency,
  daysInMonthBasis: number
): number {
  switch (frequency) {
    case 'daily':
      return amount;
    case 'weekly':
      return Math.round(amount / 7);
    case 'monthly':
      return Math.round(amount / daysInMonthBasis);
  }
}

export function calculateRunwayDays(
  balance: number,
  dailyBurn: number
): number | null {
  if (dailyBurn <= 0) {
    return null;
  }
  return balance / dailyBurn;
}

export function calculateEndDate(runwayDays: number | null): string | null {
  if (runwayDays === null) {
    return null;
  }
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + runwayDays);
  return endDate.toISOString().split('T')[0];
}

export function calculateMinutesPerPenny(dailyBurn: number): number | null {
    if (dailyBurn <= 0) {
        return null;
    }
    const minutesInDay = 24 * 60;
    return minutesInDay / dailyBurn;
}

export function calculateCashDeltaDays(
    cashDelta: number,
    dailyBurn: number
): number {
    if (dailyBurn <= 0) {
        return Infinity;
    }
    return cashDelta / dailyBurn;
}

export function calculateBurnDeltaDays(
    balance: number,
    dailyBurn: number,
    burnDelta: number
): number {
    if (dailyBurn <= 0) {
        return Infinity;
    }
    const newBurn = dailyBurn + burnDelta;
    if (newBurn <= 0) {
        return Infinity;
    }
    const originalDays = balance / dailyBurn;
    const newDays = balance / newBurn;
    return newDays - originalDays;
}

export const BASIS = 30.4375; // Average days in a month (365.25 / 12)

export function monthlyToDaily(monthlyAmount: number): number {
  return Math.round(monthlyAmount / BASIS);
}

export function dailyToMonthly(dailyAmount: number): number {
  return Math.round(dailyAmount * BASIS);
}
