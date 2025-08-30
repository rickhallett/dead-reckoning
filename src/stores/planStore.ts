import { create } from 'zustand';
import { Category, Transaction } from '../lib/types';

interface PlanState {
  isPlanMode: boolean;
  plannedCategories: Map<string, Partial<Category>>;
  plannedTransactions: Transaction[];
  togglePlanMode: () => void;
  updatePlannedCategory: (categoryId: string, updates: Partial<Category>) => void;
  addPlannedTransaction: (transaction: Transaction) => void;
  clearPlan: () => void;
}

export const usePlanStore = create<PlanState>((set) => ({
  isPlanMode: false,
  plannedCategories: new Map(),
  plannedTransactions: [],
  togglePlanMode: () => set((state) => ({ isPlanMode: !state.isPlanMode })),
  updatePlannedCategory: (categoryId, updates) =>
    set((state) => {
      const plannedCategories = new Map(state.plannedCategories);
      const existing = plannedCategories.get(categoryId) || {};
      plannedCategories.set(categoryId, { ...existing, ...updates });
      return { plannedCategories };
    }),
  addPlannedTransaction: (transaction) =>
    set((state) => ({
      plannedTransactions: [...state.plannedTransactions, transaction],
    })),
  clearPlan: () =>
    set({
      plannedCategories: new Map(),
      plannedTransactions: [],
    }),
}));