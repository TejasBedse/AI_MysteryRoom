import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { ObjectId } from 'mongodb';
import { env } from './config/env.mjs';
import { db } from './config/db.mjs';
import { assertCaseAccess, createCaseToken, storeToken } from './modules/mysteries/access.mjs';
import { CreateMysterySchema } from './modules/mysteries/schemas.mjs';
import { publicCase, publicEvidence, runGeneration } from './modules/mysteries/service.mjs';
import { getResult, submitAccusation } from './modules/accusations/service.mjs';

export const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: (origin, callback) => {
  if (!origin || env.CLIENT_ORIGIN.split(',').map(value => value.trim()).includes(origin)) return callback(null, true);
  if (process.env.NODE_ENV !== 'production') {
    try {
      const hostname = new URL(origin).hostname;
      const localDevelopmentHost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' ||
        /^10\./.test(hostname) || /^192\.168\./.test(hostname) || /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);
      if (localDevelopmentHost) return callback(null, true);
    } catch { /* Invalid origins are denied below. */ }
  }
  callback(new Error('Origin is not allowed'));
}, methods: ['GET', 'POST'], allowedHeaders: ['Content-Type', 'X-Case-Token'] }));
app.use(express.json({ limit: '32kb' }));
const expensiveLimit = rateLimit({ windowMs: env.RATE_LIMIT_WINDOW_MS, limit: env.RATE_LIMIT_MAX, standardHeaders: 'draft-7', legacyHeaders: false });
const api = express.Router();
api.get('/health', (_req, res) => res.json({ success: true, data: { status: 'ok' } }));

api.post('/mysteries', expensiveLimit, async (req, res, next) => {
  try {
    const parsed = CreateMysterySchema.safeParse(req.body);
    if (!parsed.success || parsed.data.scenario.length > env.SCENARIO_MAX_LENGTH) return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Enter a scenario within the allowed length and choose valid options.' } });
    const now = new Date();
    const doc = { title: parsed.data.title, scenario: parsed.data.scenario, difficulty: parsed.data.difficulty, category: parsed.data.category, atmosphere: parsed.data.atmosphere, status: 'generating', progress: 5, createdAt: now, updatedAt: now };
    const created = await db().collection('mysteries').insertOne(doc);
    const id = created.insertedId.toString();
    const accessToken = createCaseToken();
    await storeToken(id, accessToken);
    setTimeout(() => { void runGeneration(id, parsed.data); }, 0);
    return res.status(202).json({ success: true, data: { id, status: 'generating', accessToken } });
  } catch (error) { next(error); }
});

api.use('/mysteries/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    if (!ObjectId.isValid(id)) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Mystery not found.' } });
    const allowed = await assertCaseAccess(id, req.header('X-Case-Token'));
    if (!allowed) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Mystery not found.' } });
    next();
  } catch (error) { next(error); }
});

api.get('/mysteries/:id/status', async (req, res, next) => {
  try { const doc = await db().collection('mysteries').findOne({ _id: new ObjectId(req.params.id) }, { projection: { status: 1, progress: 1, failureCode: 1, failureMessage: 1 } }); if (!doc) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Mystery not found.' } }); res.json({ success: true, data: { status: doc.status, progress: doc.progress, failureCode: doc.failureCode, failureMessage: doc.failureMessage } }); } catch (e) { next(e); }
});
api.get('/mysteries/:id', async (req, res, next) => {
  try { const id = req.params.id; const doc = await db().collection('mysteries').findOne({ _id: new ObjectId(id), status: { $in: ['ready', 'completed'] } }); if (!doc) return res.status(409).json({ success: false, error: { code: 'CASE_NOT_READY', message: 'This mystery is not ready yet.' } }); const suspects = await db().collection('suspects').find({ mysteryId: id }).toArray(); res.json({ success: true, data: publicCase(doc, suspects) }); } catch (e) { next(e); }
});
api.get('/mysteries/:id/evidence', async (req, res, next) => {
  try { const id = req.params.id; const doc = await db().collection('mysteries').findOne({ _id: new ObjectId(id), status: { $in: ['ready', 'completed'] } }); if (!doc) return res.status(409).json({ success: false, error: { code: 'CASE_NOT_READY', message: 'This mystery is not ready yet.' } }); const items = await db().collection('evidence').find({ mysteryId: id }).toArray(); res.json({ success: true, data: items.map(publicEvidence) }); } catch (e) { next(e); }
});
api.get('/mysteries/:id/evidence/:evidenceId', async (req, res, next) => {
  try { const e = await db().collection('evidence').findOne({ id: String(req.params.evidenceId), mysteryId: String(req.params.id) }); if (!e) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Evidence not found.' } }); res.json({ success: true, data: publicEvidence(e) }); } catch (e) { next(e); }
});
api.post('/mysteries/:id/accusations', expensiveLimit, async (req, res, next) => {
  try { if (!req.body || typeof req.body.suspectId !== 'string' || Object.keys(req.body).length !== 1) return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Select one valid suspect.' } }); const result = await submitAccusation(String(req.params.id), req.body.suspectId); if (result.error === 'invalid-suspect') return res.status(400).json({ success: false, error: { code: 'INVALID_SUSPECT', message: 'Select a suspect in this case.' } }); if (result.error === 'conflict') return res.status(409).json({ success: false, error: { code: 'CASE_COMPLETED', message: 'This mystery has already been completed.' } }); res.json({ success: true, data: result.data }); } catch (e) { next(e); }
});
api.get('/mysteries/:id/result', async (req, res, next) => {
  try { const result = await getResult(req.params.id); if (!result) return res.status(409).json({ success: false, error: { code: 'RESULT_NOT_AVAILABLE', message: 'Submit an accusation to reveal the solution.' } }); res.json({ success: true, data: result }); } catch (e) { next(e); }
});
app.use('/api/v1', api);
app.use((_req, res) => res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Resource not found.' } }));
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const status = (error as any)?.type === 'entity.parse.failed' ? 400 : 503;
  if (status === 503) console.error('API dependency or server error', { errorName: error instanceof Error ? error.name : 'unknown' });
  res.status(status).json({ success: false, error: { code: status === 400 ? 'INVALID_JSON' : 'SERVICE_UNAVAILABLE', message: status === 400 ? 'Request body must be valid JSON.' : 'The service is temporarily unavailable. Please try again.' } });
});
export default app;
