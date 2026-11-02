import { ObjectId } from 'mongodb';
import { db } from '../../config/db.js';

export async function submitAccusation(id: string, suspectId: string) {
  const cases = db().collection('mysteries');
  const mystery = await cases.findOne({ _id: new ObjectId(id), status: 'ready' });
  if (!mystery) return { error: 'conflict' as const };
  const suspect = await db().collection('suspects').findOne({ id: suspectId, mysteryId: id });
  if (!suspect) return { error: 'invalid-suspect' as const };
  const solution = await db().collection('privateSolutions').findOne({ mysteryId: id });
  if (!solution) throw new Error('Private solution missing');
  const submittedAt = new Date();
  const isCorrect = suspectId === solution.culpritId;
  try {
    const result = await db().collection('accusations').insertOne({ mysteryId: id, suspectId, isCorrect, submittedAt });
    await cases.updateOne({ _id: new ObjectId(id), status: 'ready' }, { $set: { status: 'completed', completedAt: submittedAt, updatedAt: submittedAt } });
    return { data: { isCorrect, completed: true, resultId: result.insertedId.toString() } };
  } catch (error: any) {
    if (error?.code === 11000) return { error: 'conflict' as const };
    throw error;
  }
}

export async function getResult(id: string) {
  const [mystery, accusation, solution, suspects, evidence] = await Promise.all([
    db().collection('mysteries').findOne({ _id: new ObjectId(id), status: 'completed' }),
    db().collection('accusations').findOne({ mysteryId: id }),
    db().collection('privateSolutions').findOne({ mysteryId: id }),
    db().collection('suspects').find({ mysteryId: id }).toArray(),
    db().collection('evidence').find({ mysteryId: id }).toArray(),
  ]);
  if (!mystery || !accusation || !solution) return null;
  const evidenceById = new Map(evidence.map(e => [e.id, e]));
  const suspectById = new Map(suspects.map(s => [s.id, s]));
  return {
    isCorrect: accusation.isCorrect,
    accusedSuspect: suspectById.get(accusation.suspectId)?.name,
    culprit: { id: solution.culpritId, name: suspectById.get(solution.culpritId)?.name },
    motive: solution.motive, method: solution.method, explanation: solution.fullExplanation,
    supportingEvidence: (solution.essentialClueIds ?? []).map((id: string) => ({ id, title: evidenceById.get(id)?.title, explanation: solution.evidenceExplanations?.find((item: any) => item.evidenceId === id)?.explanation })),
    redHerrings: (solution.redHerringIds ?? []).map((id: string) => ({ id, title: evidenceById.get(id)?.title, explanation: solution.evidenceExplanations?.find((item: any) => item.evidenceId === id)?.explanation })),
    alternativeSuspects: (solution.alternativeSuspectExplanations ?? []).map((item: any) => ({ name: suspectById.get(item.suspectId)?.name, explanation: item.explanation })),
    timeline: solution.actualTimeline,
  };
}
