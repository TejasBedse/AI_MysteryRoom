import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { ObjectId } from 'mongodb';
import { env } from '../../config/env.mjs';
import { db } from '../../config/db.mjs';

export function createCaseToken() { return randomBytes(32).toString('base64url'); }
function digest(token: string) { return createHmac('sha256', env.CASE_TOKEN_SECRET).update(token).digest('hex'); }
export async function assertCaseAccess(id: string, token: unknown) {
  if (!ObjectId.isValid(id) || typeof token !== 'string' || token.length < 32) return false;
  const record = await db().collection('caseAccess').findOne({ mysteryId: id });
  if (!record || typeof record.tokenHash !== 'string') return false;
  const expected = Buffer.from(record.tokenHash, 'hex');
  const actual = Buffer.from(digest(token), 'hex');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
export async function storeToken(id: string, token: string) {
  await db().collection('caseAccess').insertOne({ mysteryId: id, tokenHash: digest(token), createdAt: new Date() });
}
