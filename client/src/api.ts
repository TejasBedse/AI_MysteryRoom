const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV
  ? `${window.location.protocol}//${window.location.hostname}:4000/api/v1`
  : '/api/v1');
export type Suspect = { id: string; name: string; role: string; profile: string; motiveSummary: string; alibiSummary: string };
export type Timeline = { id: string; occurredAt: string; description: string; involvedSuspectIds: string[]; relatedEvidenceIds: string[] };
export type Evidence = { id: string; type: string; title: string; description: string; occurredAt?: string; content: Record<string, unknown>; relatedSuspectIds: string[]; status: string };
export type Mystery = { id: string; title: string; incidentReport: string; difficulty: string; category: string; status: string; timeline: Timeline[]; suspects: Suspect[] };
export type Result = { isCorrect: boolean; accusedSuspect: string; culprit: { id: string; name: string }; motive: string; method: string; explanation: string; supportingEvidence: { id: string; title: string; explanation: string }[]; redHerrings: { id: string; title: string; explanation: string }[]; alternativeSuspects: { name: string; explanation: string }[]; timeline: Timeline[] };

export class ApiError extends Error { constructor(public code: string, message: string, public status: number) { super(message); } }
async function request<T>(path: string, options: RequestInit = {}, caseId?: string): Promise<T> {
  const headers = new Headers(options.headers); headers.set('Content-Type', 'application/json');
  if (caseId) { const token = sessionStorage.getItem(`case:${caseId}`); if (token) headers.set('X-Case-Token', token); }
  let response: Response;
  try {
    response = await fetch(`${API}${path}`, { ...options, headers });
  } catch {
    throw new ApiError('API_UNREACHABLE', 'Cannot reach the case server. Make sure the API is running and its MongoDB connection is valid.', 0);
  }
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.success) throw new ApiError(body?.error?.code || 'REQUEST_FAILED', body?.error?.message || 'Could not reach the case service.', response.status);
  return body.data as T;
}
export const api = {
  create: (payload: object) => request<{ id: string; status: string; accessToken: string }>('/mysteries', { method: 'POST', body: JSON.stringify(payload) }),
  status: (id: string) => request<{ status: string; progress: number; failureCode?: string; failureMessage?: string }>(`/mysteries/${id}/status`, {}, id),
  mystery: (id: string) => request<Mystery>(`/mysteries/${id}`, {}, id),
  evidence: (id: string) => request<Evidence[]>(`/mysteries/${id}/evidence`, {}, id),
  accuse: (id: string, suspectId: string) => request<{ isCorrect: boolean; completed: boolean }>(`/mysteries/${id}/accusations`, { method: 'POST', body: JSON.stringify({ suspectId }) }, id),
  result: (id: string) => request<Result>(`/mysteries/${id}/result`, {}, id),
};
