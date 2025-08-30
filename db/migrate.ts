import { createClient } from '@libsql/client';
import { readdir, readFile } from 'fs/promises';
import path from 'path';

async function main() {
  const tursoUrl = process.env.VITE_TURSO_URL;
  const tursoToken = process.env.VITE_TURSO_TOKEN;
  const profileId = process.env.VITE_DEFAULT_PROFILE_ID;
  const daysBasis = process.env.VITE_DAYS_IN_MONTH_BASIS || '30';

  if (!tursoUrl || !tursoToken || !profileId) {
    console.error(
      'Missing required environment variables: VITE_TURSO_URL, VITE_TURSO_TOKEN, VITE_DEFAULT_PROFILE_ID'
    );
    process.exit(1);
  }

  const db = createClient({
    url: tursoUrl,
    authToken: tursoToken,
  });

  try {
    console.log('Connected to Turso DB.');

    const migrationsDir = path.join(__dirname, 'migrations');
    const files = await readdir(migrationsDir);
    files.sort();

    for (const file of files) {
      if (file.endsWith('.sql')) {
        console.log(`Applying migration: ${file}...`);
        let content = await readFile(path.join(migrationsDir, file), 'utf-8');
        
        // Replace placeholders in seed script
        if (file === '002_seed.sql') {
            content = content.replace(/\$\{VITE_DEFAULT_PROFILE_ID\}/g, profileId);
            content = content.replace(/\$\{VITE_DAYS_IN_MONTH_BASIS\}/g, daysBasis);
        }

        // Split content into individual statements to execute them separately
        const statements = content.split(';').filter(s => s.trim().length > 0);
        for (const statement of statements) {
            await db.execute(statement);
        }
        console.log(`Migration ${file} applied successfully.`);
      }
    }

    console.log('All migrations applied successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    db.close();
    console.log('Connection closed.');
  }
}

main();
