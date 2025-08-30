export type Frequency = 'daily' | 'weekly' | 'monthly';

export interface Category {
  category_id: string;
  profile_id: string;
  name: string;
  amount_p: number;        // as entered with frequency
  frequency: Frequency;
  optional: 0 | 1;
  step_p: number;
  min_p: number;
  is_active: 0 | 1;
  version: number;
  updated_by_device_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryDaily {
  category_id: string;
  name: string;
  daily_p: number;         // computed
}

export interface RunwayRow {
  balance_p: number;
  daily_burn_p: number;
  runway_days: number | null;
  runway_ends_at: string | null;
  minutes_per_penny: number | null; // from view
}

export interface Transaction {
  tx_id: string;
  profile_id: string;
  amount_p: number;        // + income, - expense
  note?: string;
  occurred_at: string;     // ISO
  created_by_device_id?: string;
  created_at: string;
}
