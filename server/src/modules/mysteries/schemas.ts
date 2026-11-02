import { z } from 'zod';

export const CreateMysterySchema = z.object({
  scenario: z.string().trim().min(1).max(2000),
  title: z.string().trim().max(100).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  category: z.enum(['theft', 'disappearance', 'murder-mystery', 'corporate', 'personal', 'other']).default('other'),
  atmosphere: z.enum(['realistic', 'suspenseful', 'noir', 'lighthearted']).default('realistic'),
}).strict();

export const TimelineEventSchema = z.object({ id: z.string().min(1), occurredAt: z.string().datetime(), description: z.string().min(1), involvedSuspectIds: z.array(z.string()), relatedEvidenceIds: z.array(z.string()) }).strict();
const SuspectSchema = z.object({ id: z.string().min(1), name: z.string().min(1), role: z.string().min(1), profile: z.string().min(1), motiveSummary: z.string().min(1), alibiSummary: z.string().min(1) }).strict();
const EvidenceSchema = z.object({ id: z.string().min(1), type: z.enum(['chat', 'image', 'cctv', 'witness', 'document', 'timeline']), title: z.string().min(1), description: z.string().min(1), occurredAt: z.string().datetime().optional(), content: z.record(z.unknown()), relatedSuspectIds: z.array(z.string()), relatedTimelineEventIds: z.array(z.string()) }).strict();
export const BlueprintSchema = z.object({
  title: z.string().min(1), incidentReport: z.string().min(1), normalizedPremise: z.string().min(1),
  suspects: z.array(SuspectSchema).min(3).max(5),
  solution: z.object({ culpritId: z.string().min(1), motive: z.string().min(1), method: z.string().min(1), fullExplanation: z.string().min(1), essentialClueIds: z.array(z.string()).min(3), redHerringIds: z.array(z.string()), evidenceExplanations: z.array(z.object({ evidenceId: z.string(), explanation: z.string() })), alternativeSuspectExplanations: z.array(z.object({ suspectId: z.string(), explanation: z.string() })) }).strict(),
  timeline: z.array(TimelineEventSchema).min(3),
  evidence: z.array(EvidenceSchema).min(6).max(10),
}).strict();
export type CreateMysteryInput = z.infer<typeof CreateMysterySchema>;
export type Blueprint = z.infer<typeof BlueprintSchema>;

export function validateBlueprint(b: Blueprint) {
  const suspectIds = new Set(b.suspects.map(s => s.id));
  const evidenceIds = new Set(b.evidence.map(e => e.id));
  const timelineIds = new Set(b.timeline.map(t => t.id));
  if (suspectIds.size !== b.suspects.length || evidenceIds.size !== b.evidence.length || timelineIds.size !== b.timeline.length) throw new Error('Duplicate generated identifiers');
  if (!suspectIds.has(b.solution.culpritId)) throw new Error('Culprit must reference a suspect');
  if (b.solution.essentialClueIds.some(id => !evidenceIds.has(id))) throw new Error('Essential clue references unknown evidence');
  if (b.solution.redHerringIds.some(id => !evidenceIds.has(id))) throw new Error('Red herring references unknown evidence');
  if (b.solution.evidenceExplanations.some(x => !evidenceIds.has(x.evidenceId))) throw new Error('Explanation references unknown evidence');
  if (new Set(b.solution.evidenceExplanations.map(x => x.evidenceId)).size !== b.solution.evidenceExplanations.length || b.solution.evidenceExplanations.length !== evidenceIds.size) throw new Error('Every evidence item needs exactly one explanation');
  if (b.solution.essentialClueIds.some(id => b.solution.redHerringIds.includes(id))) throw new Error('A clue cannot be both essential and a red herring');
  if (b.solution.alternativeSuspectExplanations.some(x => !suspectIds.has(x.suspectId) || x.suspectId === b.solution.culpritId)) throw new Error('Alternative suspect explanation references an invalid suspect');
  if (new Set(b.solution.alternativeSuspectExplanations.map(x => x.suspectId)).size !== b.solution.alternativeSuspectExplanations.length || b.solution.alternativeSuspectExplanations.length !== suspectIds.size - 1) throw new Error('Every alternative suspect needs exactly one explanation');
  if (b.timeline.some(t => t.involvedSuspectIds.some(id => !suspectIds.has(id)) || t.relatedEvidenceIds.some(id => !evidenceIds.has(id)))) throw new Error('Timeline references unknown records');
  if (b.evidence.some(e => e.relatedSuspectIds.some(id => !suspectIds.has(id)) || e.relatedTimelineEventIds.some(id => !timelineIds.has(id)))) throw new Error('Evidence references unknown records');
  const times = b.timeline.map(t => Date.parse(t.occurredAt));
  if (times.some((time, i) => i > 0 && time < times[i - 1])) throw new Error('Timeline is not chronological');
}
