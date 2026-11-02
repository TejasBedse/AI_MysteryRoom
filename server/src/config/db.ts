import { MongoClient, type Db } from 'mongodb';
import { env } from './env.js';

let client: MongoClient;
let database: Db;
export async function connectDatabase() {
  client = new MongoClient(env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  await client.connect();
  database = client.db();
  await Promise.all([
    database.collection('mysteries').createIndex({ createdAt: -1 }),
    database.collection('suspects').createIndex({ mysteryId: 1 }),
    database.collection('evidence').createIndex({ mysteryId: 1 }),
    database.collection('privateSolutions').createIndex({ mysteryId: 1 }, { unique: true }),
    database.collection('caseAccess').createIndex({ mysteryId: 1 }, { unique: true }),
    database.collection('accusations').createIndex({ mysteryId: 1 }, { unique: true }),
  ]);
  return database;
}
export function db() { if (!database) throw new Error('Database unavailable'); return database; }
export async function closeDatabase() { if (client) await client.close(); }
