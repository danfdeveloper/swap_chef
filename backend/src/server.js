import { createApp } from './app.js';
import { config } from './config.js';
import { createSQLiteStore } from './store/sqliteStore.js';

const store = createSQLiteStore();
const app = createApp({ store });

app.listen(config.port, () => {
    console.log(`Swap Chef API listening on http://localhost:${config.port}`);
    console.log('Using SQLite: users and recipes persist across server restarts.');
});