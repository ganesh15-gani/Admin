"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@libsql/client");
async function main() {
    const client = (0, client_1.createClient)({ url: 'file:dev.db' });
    const result = await client.execute('SELECT sqlite_version()');
    console.log('SQLite Version:', result.rows);
}
main().catch(console.error);
//# sourceMappingURL=test_libsql.js.map