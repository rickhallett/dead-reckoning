import { exec } from '../lib/db';
import { v4 as uuidv4 } from 'uuid';

export function useTransactions() {
  const addTransaction = async (transaction: {
    amount_p: number;
    note?: string;
  }) => {
    const tx_id = uuidv4();
    const profile_id = 'user-profile-id'; // Replace with actual profile ID
    const occurred_at = new Date().toISOString();
    const created_by_device_id = 'device-id'; // Replace with actual device ID

    const sql = `
      INSERT INTO transactions (tx_id, profile_id, amount_p, note, occurred_at, created_by_device_id)
      VALUES (?, ?, ?, ?, ?, ?);
    `;

    const params = [
      tx_id,
      profile_id,
      transaction.amount_p,
      transaction.note,
      occurred_at,
      created_by_device_id,
    ];

    await exec(sql, params);
  };

  return { addTransaction };
}
