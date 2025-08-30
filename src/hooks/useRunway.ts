import { useQuery } from '@tanstack/react-query';
import { db } from '../lib/db';
import type { RunwayRow } from '../lib/types';

const VITE_DEFAULT_PROFILE_ID = import.meta.env.VITE_DEFAULT_PROFILE_ID;

export interface RunwayData extends RunwayRow {
  minutes_per_penny: number | null;
}

async function fetchRunwayData(): Promise<RunwayData> {
  const sql = `
    SELECT
      r.balance_p, r.daily_burn_p, r.runway_days, r.runway_ends_at,
      p2m.minutes_per_penny
    FROM runway_view r
    JOIN penny_to_minutes_view p2m USING (profile_id)
    WHERE r.profile_id = ?;
  `;
  const params = [VITE_DEFAULT_PROFILE_ID];
  
  const result = await db.execute({ sql, args: params });

  if (result.rows.length === 0) {
    throw new Error('No runway data found for the given profile ID.');
  }
  
  return result.rows[0] as unknown as RunwayData;
}

export function useRunway() {
  return useQuery<RunwayData, Error>({
    queryKey: ['runwayData', VITE_DEFAULT_PROFILE_ID],
    queryFn: fetchRunwayData,
  });
}
