import { app } from './app.js';
import { connectDatabase, closeDatabase } from './config/db.js';
import { env } from './config/env.js';

try {
  await connectDatabase();
} catch {
  console.error('MongoDB connection failed. Check MONGODB_URI in the root .env file and confirm that database is reachable.');
  process.exit(1);
}
const server = app.listen(env.PORT, () => console.log(`AI Mystery Room API listening on ${env.PORT}`));
async function shutdown() { server.close(); await closeDatabase(); process.exit(0); }
process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());
