import React from 'react';
import { usePlanMode } from '../hooks/usePlanMode';
import { Category } from '../lib/types';

interface PlanBarProps {
  liveCategories: Category[];
  liveBalance: number;
  liveDailyBurn: number;
}

export function PlanBar({ liveCategories, liveBalance, liveDailyBurn }: PlanBarProps) {
  const { applyPlan, discardPlan, deltaDays } = usePlanMode(liveCategories, liveBalance, liveDailyBurn);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '1rem',
        backgroundColor: '#333',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <span>Net change: {deltaDays.toFixed(2)} days</span>
      <div>
        <button onClick={applyPlan}>Apply</button>
        <button onClick={discardPlan}>Discard</button>
      </div>
    </div>
  );
}