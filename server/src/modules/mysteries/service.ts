import { ObjectId } from 'mongodb';
import { db } from '../../config/db.js';
import { generateBlueprint } from '../ai/geminiProvider.js';
import type { CreateMysteryInput } from './schemas.js';

function generationFailure(error: unknown) {
  const value = error as { name?: string; message?: string; status?: number; cause?: { code?: string } };
  if (value.status === 401 || value.status === 403) return { code: 'GEMINI_AUTH_ERROR', message: 'Gemini rejected the API key. Check GEMINI_API_KEY in .env.' };
  if (value.status === 404) return { code: 'GEMINI_MODEL_NOT_FOUND', message: 'The configured Gemini model is unavailable. Check GEMINI_TEXT_MODEL in .env.' };
  if (value.status === 429) return { code: 'GEMINI_RATE_LIMITED', message: 'Gemini is rate limited or out of quota. Wait and try again.' };
  if (typeof value.status === 'number' && value.status >= 500) return { code: 'GEMINI_UNAVAILABLE', message: 'Gemini is temporarily unavailable. Try again shortly.' };
  if (value.message === 'AI provider is not configured') return { code: 'AI_NOT_CONFIGURED', message: 'Set GEMINI_API_KEY in .env, then restart the server.' };
  if (value.message === 'AI request timed out') return { code: 'AI_TIMEOUT', message: 'Gemini took too long to respond. Retry in a moment; the server will try its fallback model.' };
  if (value.name === 'ZodError' || value.message?.includes('references unknown') || value.message?.includes('Duplicate generated') || value.message?.includes('chronological')) return { code: 'INVALID_GENERATED_CASE', message: 'Gemini returned a case that failed consistency checks. Try generating again.' };
  if (value.cause?.code) return { code: 'AI_NETWORK_ERROR', message: 'The server could not reach Gemini. Check network access and try again.' };
  return { code: 'GENERATION_FAILED', message: 'The case could not be prepared. Check Gemini configuration and try again.' };
}

export async function runGeneration(id: string, input: CreateMysteryInput) {
  const cases = db().collection('mysteries');
  try {
    const blueprint = await generateBlueprint(input);
    await cases.updateOne({ _id: new ObjectId(id), status: 'generating' }, { $set: { status: 'validating', progress: 75, updatedAt: new Date() } });
    const now = new Date();
    const suspects = blueprint.suspects.map(s => ({ ...s, mysteryId: id, createdAt: now }));
    const evidence = blueprint.evidence.map(e => ({ ...e, mysteryId: id, visibility: 'public', status: 'ready', createdAt: now }));
    await db().collection('suspects').insertMany(suspects);
    await db().collection('evidence').insertMany(evidence);
    await db().collection('privateSolutions').insertOne({ mysteryId: id, ...blueprint.solution, actualTimeline: blueprint.timeline, createdAt: now });
    await cases.updateOne({ _id: new ObjectId(id) }, { $set: { title: input.title || blueprint.title, incidentReport: blueprint.incidentReport, normalizedPremise: blueprint.normalizedPremise, timeline: blueprint.timeline, suspectIds: blueprint.suspects.map(s => s.id), evidenceIds: blueprint.evidence.map(e => e.id), status: 'ready', progress: 100, updatedAt: now } });
  } catch (error) {
    const failure = generationFailure(error);
    const providerStatus = (error as { status?: number } | null)?.status;
    const providerCode = (error as { code?: string | number } | null)?.code;
    const issues = (error as { issues?: Array<{ path?: Array<string | number>; code?: string }> } | null)?.issues;
    const validationIssues = Array.isArray(issues) ? issues.map(issue => ({ path: issue.path?.join('.') || 'root', code: issue.code })) : undefined;
    console.error('Mystery generation failed', { caseId: id, errorName: error instanceof Error ? error.name : 'unknown', providerStatus, providerCode, failureCode: failure.code, validationIssues });
    try {
      await cases.updateOne({ _id: new ObjectId(id) }, { $set: { status: 'failed', progress: 0, failureCode: failure.code, failureMessage: failure.message, updatedAt: new Date() } });
      await Promise.all([
        db().collection('suspects').deleteMany({ mysteryId: id }),
        db().collection('evidence').deleteMany({ mysteryId: id }),
        db().collection('privateSolutions').deleteMany({ mysteryId: id }),
      ]);
    } catch { console.error('Could not persist failed generation state', { caseId: id }); }
  }
}

export function publicCase(doc: any, suspects: any[]) {
  return { id: doc._id.toString(), title: doc.title, incidentReport: doc.incidentReport, difficulty: doc.difficulty, category: doc.category, atmosphere: doc.atmosphere, status: doc.status, createdAt: doc.createdAt, timeline: (doc.timeline ?? []).map((t: any) => ({ id: t.id, occurredAt: t.occurredAt, description: t.description, involvedSuspectIds: t.involvedSuspectIds, relatedEvidenceIds: t.relatedEvidenceIds })), suspects: suspects.map(s => ({ id: s.id, name: s.name, role: s.role, profile: s.profile, motiveSummary: s.motiveSummary, alibiSummary: s.alibiSummary })) };
}
export function publicEvidence(e: any) { return { id: e.id, type: e.type, title: e.title, description: e.description, occurredAt: e.occurredAt, content: e.content, relatedSuspectIds: e.relatedSuspectIds, status: e.status }; }
