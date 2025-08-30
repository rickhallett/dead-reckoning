import { createClient, InValue } from '@libsql/client/web';

const tursoUrl = import.meta.env.VITE_TURSO_URL;
const tursoToken = import.meta.env.VITE_TURSO_TOKEN;

if (!tursoUrl || !tursoToken) {
  throw new Error('Missing required environment variables: VITE_TURSO_URL, VITE_TURSO_TOKEN');
}

export const db = createClient({
  url: tursoUrl,
  authToken: tursoToken,
});

export async function query<T>(sql: string, params: InValue[]): Promise<T[]> {
    const result = await db.execute({ sql, args: params });
    return result.rows as unknown as T[];
}

export async function exec(sql: string, params: InValue[]): Promise<void> {
    await db.execute({ sql, args: params });
}
