import { useState, useEffect, useCallback } from 'react';
import { query, exec } from '../lib/db';
import { Category } from '../lib/types';

const PROFILE_ID = 'default-profile'; // Hardcoded for now

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const sql = `
        SELECT category_id, name, amount_p, frequency, optional, step_p, min_p, is_active, profile_id, version, updated_by_device_id, created_at, updated_at
        FROM categories
        WHERE profile_id = ? AND is_active = 1
        ORDER BY name ASC;
      `;
      const result = await query<Category>(sql, [PROFILE_ID]);
      setCategories(result);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const updateCategory = useCallback(async (categoryId: string, updates: Partial<Pick<Category, 'amount_p' | 'frequency'>>) => {
    try {
      const sql = `
        UPDATE categories
        SET amount_p = ?, frequency = ?, updated_at = datetime('now')
        WHERE profile_id = ? AND category_id = ?;
      `;
      await exec(sql, [updates.amount_p, updates.frequency, PROFILE_ID, categoryId]);
      // Refetch categories to get the updated data
      await fetchCategories();
    } catch (e) {
      setError(e as Error);
      // Optionally, revert optimistic updates here
    }
  }, [fetchCategories]);

  return { categories, loading, error, updateCategory, refetch: fetchCategories };
}
