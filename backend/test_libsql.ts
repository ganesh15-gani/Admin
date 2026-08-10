import { createClient } from '@libsql/client';

async function main() {
  const client = createClient({ url: 'file:dev.db' });
  const result = await client.execute('SELECT sqlite_version()');
  console.log('SQLite Version:', result.rows);
}

main().catch(console.error);
