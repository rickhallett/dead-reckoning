import { usePlanStore } from '../stores/planStore';
import { exec } from '../lib/db';
import { v4 as uuidv4 } from 'uuid';
import {
  calculateBurnDeltaDays,
  calculateCashDeltaDays,
  convertAmountToDaily,
} from '../lib/math';
import { Category } from '../lib/types';

export function usePlanMode(
  liveCategories: Category[],
  liveBalance: number,
  liveDailyBurn: number
) {
  const {
    isPlanMode,
    plannedCategories,
    plannedTransactions,
    togglePlanMode,
    clearPlan,
  } = usePlanStore();

  const applyPlan = async () => {
    const profile_id = 'user-profile-id'; // Replace with actual profile ID
    const created_by_device_id = 'device-id'; // Replace with actual device ID

    // Apply category changes
    for (const [categoryId, updates] of plannedCategories.entries()) {
      const sql = `
        UPDATE categories
        SET name = ?, amount_p = ?, frequency = ?, optional = ?, step_p = ?, min_p = ?, is_active = ?, version = version + 1, updated_by_device_id = ?
        WHERE category_id = ?;
      `;
      const existingCategory = liveCategories.find(c => c.category_id === categoryId)!;
      const params = [
        updates.name || existingCategory.name,
        updates.amount_p || existingCategory.amount_p,
        updates.frequency || existingCategory.frequency,
        updates.optional || existingCategory.optional,
        updates.step_p || existingCategory.step_p,
        updates.min_p || existingCategory.min_p,
        updates.is_active || existingCategory.is_active,
        created_by_device_id,
        categoryId,
      ];
      await exec(sql, params);
    }

    // Apply transaction changes
    for (const transaction of plannedTransactions) {
      const tx_sql = `
        INSERT INTO transactions (tx_id, profile_id, amount_p, note, occurred_at, created_by_device_id)
        VALUES (?, ?, ?, ?, ?, ?);
      `;
      const tx_params = [
        transaction.tx_id,
        profile_id,
        transaction.amount_p,
        transaction.note,
        transaction.occurred_at,
        created_by_device_id,
      ];
      await exec(tx_sql, tx_params);
    }

    // Create audit log
    const audit_id = uuidv4();
    const kind = 'plan_apply';
    const detail_json = JSON.stringify({
      categories: Object.fromEntries(plannedCategories),
      transactions: plannedTransactions,
    });
    const delta_days = calculateDeltaDays();

    const audit_sql = `
      INSERT INTO audit_log (audit_id, profile_id, kind, detail_json, delta_days, created_by_device_id)
      VALUES (?, ?, ?, ?, ?, ?);
    `;
    const audit_params = [
      audit_id,
      profile_id,
      kind,
      detail_json,
      delta_days,
      created_by_device_id,
    ];
    await exec(audit_sql, audit_params);

    clearPlan();
    togglePlanMode();
  };

  const discardPlan = () => {
    clearPlan();
    togglePlanMode();
  };

  const calculateDeltaDays = () => {
    let cashDelta = 0;
    let burnDelta = 0;

    for (const transaction of plannedTransactions) {
      cashDelta += transaction.amount_p;
    }

    for (const [categoryId, updates] of plannedCategories.entries()) {
        const existingCategory = liveCategories.find(c => c.category_id === categoryId)!;
        const oldDaily = convertAmountToDaily(existingCategory.amount_p, existingCategory.frequency, 30);
        const newDaily = convertAmountToDaily(updates.amount_p || existingCategory.amount_p, updates.frequency || existingCategory.frequency, 30);
        burnDelta += (newDaily - oldDaily);
    }

    const cashDeltaDays = calculateCashDeltaDays(cashDelta, liveDailyBurn);
    const burnDeltaDays = calculateBurnDeltaDays(liveBalance + cashDelta, liveDailyBurn, burnDelta);

    return cashDeltaDays + burnDeltaDays;
  };

  return {
    isPlanMode,
    togglePlanMode,
    applyPlan,
    discardPlan,
    deltaDays: calculateDeltaDays(),
  };
}