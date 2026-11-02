import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { ZodError } from 'zod';
import { env } from '../../config/env.js';
import { BlueprintSchema, type Blueprint, type CreateMysteryInput, validateBlueprint } from '../mysteries/schemas.js';
import { BLUEPRINT_PROMPT } from './prompts.js';

const responseSchema = {
  type: 'object', required: ['title','incidentReport','normalizedPremise','suspects','solution','timeline','evidence'],
  properties: {
    title: {type:'string'}, incidentReport: {type:'string'}, normalizedPremise:{type:'string'},
    suspects:{type:'array',minItems:3,maxItems:3,items:{type:'object',required:['id','name','role','profile','motiveSummary','alibiSummary'],properties:{id:{type:'string'},name:{type:'string'},role:{type:'string'},profile:{type:'string'},motiveSummary:{type:'string'},alibiSummary:{type:'string'}}}},
    solution:{type:'object',required:['culpritId','motive','method','fullExplanation','essentialClueIds','redHerringIds','evidenceExplanations','alternativeSuspectExplanations'],properties:{culpritId:{type:'string'},motive:{type:'string'},method:{type:'string'},fullExplanation:{type:'string'},essentialClueIds:{type:'array',items:{type:'string'}},redHerringIds:{type:'array',items:{type:'string'}},evidenceExplanations:{type:'array',items:{type:'object',required:['evidenceId','explanation'],properties:{evidenceId:{type:'string'},explanation:{type:'string'}}}},alternativeSuspectExplanations:{type:'array',items:{type:'object',required:['suspectId','explanation'],properties:{suspectId:{type:'string'},explanation:{type:'string'}}}}}},
    timeline:{type:'array',items:{type:'object',required:['id','occurredAt','description','involvedSuspectIds','relatedEvidenceIds'],properties:{id:{type:'string'},occurredAt:{type:'string'},description:{type:'string'},involvedSuspectIds:{type:'array',items:{type:'string'}},relatedEvidenceIds:{type:'array',items:{type:'string'}}}}},
    evidence:{type:'array',minItems:6,maxItems:6,items:{type:'object',required:['id','type','title','description','content','relatedSuspectIds','relatedTimelineEventIds'],properties:{id:{type:'string'},type:{type:'string',enum:['chat','image','cctv','witness','document','timeline']},title:{type:'string'},description:{type:'string'},occurredAt:{type:'string'},content:{type:'object',additionalProperties:true},relatedSuspectIds:{type:'array',items:{type:'string'}},relatedTimelineEventIds:{type:'array',items:{type:'string'}}}}}
  }
};

export async function generateBlueprint(input: CreateMysteryInput): Promise<Blueprint> {
  if (!env.GEMINI_API_KEY) throw new Error('AI provider is not configured');
  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  const safeScenario = input.scenario.replaceAll(']]>', ']]&gt;');
  const difficultyGuidance = {
    easy: 'Use clearer, more direct clues, simpler motives, and fewer red herrings. Make the key deduction easy to notice.',
    medium: 'Balance direct and subtle clues, with a small number of plausible red herrings. Require comparing at least two pieces of evidence.',
    hard: 'Use subtler but fair clues, layered motives, and several plausible red herrings. Require cross-referencing evidence, while keeping the solution provable from the case.',
  }[input.difficulty];
  const prompt = `${BLUEPRINT_PROMPT}\n\n<scenario>${safeScenario}</scenario>\nTITLE PREFERENCE: ${input.title ?? 'choose one'}\nDIFFICULTY: ${input.difficulty}\nDIFFICULTY GUIDANCE: ${difficultyGuidance}\nCATEGORY: ${input.category}\nATMOSPHERE: ${input.atmosphere}`;
  let lastError: unknown;
  const models = [...new Set([env.GEMINI_TEXT_MODEL, env.GEMINI_FALLBACK_TEXT_MODEL])];
  for (const model of models) {
    let useFallback = false;
    let repairNotes = '';
    for (let attempt = 0; attempt <= env.AI_RETRIES; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), env.AI_TIMEOUT_MS);
      try {
        const response = await ai.models.generateContent({ model, contents: `${prompt}${repairNotes}`, config: { responseMimeType: 'application/json', responseSchema, maxOutputTokens: 9000, thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }, abortSignal: controller.signal } });
        if (!response.text) throw new Error('Empty AI response');
        const parsed = BlueprintSchema.parse(JSON.parse(response.text));
        validateBlueprint(parsed);
        return parsed;
      } catch (error) {
        lastError = controller.signal.aborted ? new Error('AI request timed out') : error;
        const status = (lastError as { status?: number } | null)?.status;
        if (status === 401 || status === 403) throw lastError;
        const transient = status === 429 || (typeof status === 'number' && status >= 500) ||
          (lastError instanceof Error && (lastError.message === 'AI request timed out' || Boolean((lastError as Error & { cause?: { code?: string } }).cause?.code)));
        if (transient) { useFallback = true; break; }
        const validationFailure = lastError instanceof ZodError || lastError instanceof SyntaxError ||
          (lastError instanceof Error && /references unknown|Duplicate generated|chronological|essential clue|alternative suspect|explanation/.test(lastError.message));
        if (validationFailure) {
          if (lastError instanceof ZodError) {
            const paths = lastError.issues.map(issue => issue.path.join('.') || 'root');
            repairNotes = `\n\nCORRECTION REQUIRED: The previous JSON failed validation at these fields: ${[...new Set(paths)].join(', ')}. Return the complete case again with all fields corrected. Timestamps must be ISO 8601 UTC strings ending in Z. Do not omit required solution explanations.`;
          } else {
            repairNotes = `\n\nCORRECTION REQUIRED: ${(lastError as Error).message}. Return the complete case again, preserving the established requirements and fixing this validation issue.`;
          }
          useFallback = attempt === env.AI_RETRIES;
          continue;
        }
        break;
      } finally { clearTimeout(timer); }
    }
    if (!useFallback) break;
  }
  throw lastError instanceof Error ? lastError : new Error('Mystery generation failed');
}
