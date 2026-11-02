import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, type Evidence, type Mystery } from '../api';

function readList(key: string): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
  } catch { return []; }
}

function EvidenceContent({ evidence }: { evidence: Evidence }) {
  const content = evidence.content || {};
  const messages = Array.isArray(content.messages) ? content.messages as Record<string, unknown>[] : null;
  const events = Array.isArray(content.events) ? content.events as Record<string, unknown>[] : null;
  const value = (v: unknown) => v == null ? '' : typeof v === 'string' || typeof v === 'number' ? String(v) : JSON.stringify(v, null, 2);
  return <div className="evidence-content">
    {messages?.map((m, i) => <article className="chat-message" key={i}><div><strong>{value(m.sender || m.name || 'Someone')}</strong><time>{value(m.timestamp || m.time)}</time></div><p>{value(m.text || m.message || m.body)}</p></article>)}
    {events?.map((e, i) => <article className="event-row" key={i}><time>{value(e.timestamp || e.time)}</time><p>{value(e.description || e.event || e.text)}</p></article>)}
    {!messages && !events && <pre>{Object.entries(content).map(([k, v]) => `${k}: ${value(v)}`).join('\n')}</pre>}
  </div>;
}

export default function CaseRoom() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const [mystery, setMystery] = useState<Mystery | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [selected, setSelected] = useState<Evidence | null>(null);
  const [suspect, setSuspect] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');
  const [cluesRead, setCluesRead] = useState<string[]>(() => readList(`clues:${id}`));
  const [suspectsRead, setSuspectsRead] = useState<string[]>(() => readList(`suspects:${id}`));
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    try {
      const status = await api.status(id);
      if (status.status === 'generating' || status.status === 'validating') { nav(`/case/${id}/loading`, { replace: true }); return; }
      const m = await api.mystery(id);
      if (m.status === 'completed') { nav(`/case/${id}/result`, { replace: true }); return; }
      const e = await api.evidence(id);
      setMystery(m); setEvidence(e);
      setCluesRead(readList(`clues:${id}`).filter(x => e.some(item => item.id === x)));
      setSuspectsRead(readList(`suspects:${id}`).filter(x => m.suspects.some(item => item.id === x)));
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not open this case.'); }
    finally { setLoading(false); }
  }, [id, nav]);
  useEffect(() => { void load(); setNotes(localStorage.getItem(`notes:${id}`) || ''); }, [load, id]);
  useEffect(() => { localStorage.setItem(`notes:${id}`, notes); }, [id, notes]);
  useEffect(() => { localStorage.setItem(`clues:${id}`, JSON.stringify(cluesRead)); }, [id, cluesRead]);
  useEffect(() => { localStorage.setItem(`suspects:${id}`, JSON.stringify(suspectsRead)); }, [id, suspectsRead]);

  function reward(message: string) { setToast(message); window.setTimeout(() => setToast(''), 2200); }
  function inspectClue(item: Evidence) {
    setSelected(item);
    if (!cluesRead.includes(item.id)) { setCluesRead(old => [...old, item.id]); reward('Clue checked · +10 points'); }
  }
  function inspectSuspect(person: Mystery['suspects'][number]) {
    setSuspect(person.id);
    if (!suspectsRead.includes(person.id)) { setSuspectsRead(old => [...old, person.id]); reward('Suspect checked · +15 points'); }
  }
  async function accuse() {
    try { await api.accuse(id, suspect); nav(`/case/${id}/result`); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not send your choice.'); setConfirm(false); }
  }
  if (loading) return <><header className="topbar"><a className="brand" href="/"><span className="brand-mark">M</span><span>THE MYSTERY ROOM<small>YOUR CASE</small></span></a></header><main className="loading-inline">Opening your case…</main></>;
  if (error || !mystery) return <><header className="topbar"><a className="brand" href="/"><span className="brand-mark">M</span><span>THE MYSTERY ROOM<small>YOUR CASE</small></span></a></header><main className="error-panel"><div className="eyebrow">CASE UNAVAILABLE</div><h2>{error || 'We could not find this case.'}</h2><Link to="/create" className="button primary">Make a new case</Link></main></>;

  const total = evidence.length + mystery.suspects.length;
  const done = cluesRead.length + suspectsRead.length;
  const percent = total ? Math.round(done / total * 100) : 0;
  const points = cluesRead.length * 10 + suspectsRead.length * 15;
  const rank = points >= 100 ? 'MASTER DETECTIVE' : points >= 50 ? 'ACE INVESTIGATOR' : 'ROOKIE DETECTIVE';
  return <><header className="topbar"><a className="brand" href="/"><span className="brand-mark">M</span><span>THE MYSTERY ROOM<small>YOUR CASE</small></span></a><span className="top-note">FICTIONAL CASE</span></header><main className="case-game">
    <div className="case-top"><div><div className="eyebrow"><span className="case-emblem">⌕</span> ACTIVE INVESTIGATION · {mystery.category}</div><h1>{mystery.title}</h1><p>{mystery.incidentReport}</p></div><span className="difficulty-pill">◈ {mystery.difficulty} case</span></div>
    <section className="mission-hud" aria-label="Your case progress">
      <div className="mission-copy"><span className="eyebrow">YOUR GOAL</span><h2>Find out who did it</h2><p>Check the clues and meet the suspects. Explore in any order, then choose who you think is guilty.</p></div>
      <div className="mission-stats"><strong>{done} <small>of {total} checked</small></strong><div className="mission-track"><span style={{ width: `${percent}%` }}/></div><span>{percent}% explored</span></div>
      <div className="xp-card"><span>✦ CASE XP</span><strong>{points}</strong><small>{rank}</small></div>
      <div className="milestone-list"><span className={cluesRead.length ? 'milestone unlocked' : 'milestone'}>✦ First clue</span><span className={evidence.length > 0 && cluesRead.length === evidence.length ? 'milestone unlocked' : 'milestone'}>✦ All clues checked</span><span className={mystery.suspects.length > 0 && suspectsRead.length === mystery.suspects.length ? 'milestone unlocked' : 'milestone'}>✦ All suspects met</span></div>
    </section>
    <div className="case-columns">
      <aside className="suspect-panel"><div className="section-cap">SUSPECTS <span>{suspectsRead.length}/{mystery.suspects.length}</span></div>
        {mystery.suspects.map((person, i) => <button className={`suspect-card ${suspect === person.id ? 'active' : ''}`} key={person.id} onClick={() => inspectSuspect(person)}><span className="suspect-number">0{i + 1}</span><span className="suspect-name">{person.name} {suspectsRead.includes(person.id) && <b className="checked-tag">✓ CHECKED</b>}<small>{person.role}</small></span><span>↗</span><p>{person.profile}</p><div><b>Reason</b><p>{person.motiveSummary}</p><b>Their story</b><p>{person.alibiSummary}</p></div></button>)}
        <label className="notes-box"><span className="section-cap">YOUR NOTES</span><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Write down what seems important…" /></label>
      </aside>
      <section className="clue-panel"><div className="section-cap">CLUES <span>{cluesRead.length}/{evidence.length} checked</span></div><p className="game-hint">Open any clue to read it. Look for details that do not fit.</p><div className="clue-grid">{evidence.map((item, i) => <button className={`clue-card ${cluesRead.includes(item.id) ? 'checked' : ''}`} key={item.id} onClick={() => inspectClue(item)}><span className="clue-number">CLUE {String(i + 1).padStart(2, '0')}</span>{cluesRead.includes(item.id) && <b className="checked-tag">✓ CHECKED</b>}<strong>{item.title}</strong><p>{item.description}</p><small>{item.type}</small><span className="clue-open">OPEN CLUE ↗</span></button>)}</div>
        <div className="timeline-panel"><div className="section-cap">WHAT HAPPENED, WHEN</div><div className="timeline-list">{mystery.timeline.map(t => <div className="timeline-row" key={t.id}><time>{new Date(t.occurredAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</time><span className="timeline-dot"/><p>{t.description}</p></div>)}</div></div>
      </section>
    </div>
    <section className="final-choice"><div><span className="eyebrow">READY TO DECIDE?</span><h2>Who did it?</h2><p>Choose a suspect above. You can make one final choice.</p></div><button className="button primary" disabled={!suspect} onClick={() => setConfirm(true)}>Make my choice ↗</button></section>
    {toast && <div className="game-toast" role="status" aria-live="polite">{toast}</div>}
    {selected && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setSelected(null); }}><section className="evidence-modal" role="dialog" aria-modal="true" aria-labelledby="clue-title"><button className="modal-close" onClick={() => setSelected(null)} aria-label="Close clue">×</button><div className="eyebrow">CLUE · {selected.type}</div><h2 id="clue-title">{selected.title}</h2><p>{selected.description}</p>{selected.occurredAt && <time>{new Date(selected.occurredAt).toLocaleString()}</time>}<EvidenceContent evidence={selected}/><button className="button primary" onClick={() => setSelected(null)}>Back to my case</button></section></div>}
    {confirm && <div className="modal-backdrop"><section className="confirm-modal" role="dialog" aria-modal="true"><div className="eyebrow">FINAL CHOICE</div><h2>Choose {mystery.suspects.find(s => s.id === suspect)?.name}?</h2><p>You will see the full story after your choice.</p><div><button className="button secondary" onClick={() => setConfirm(false)}>Keep looking</button><button className="button primary" onClick={() => void accuse()}>Yes, make my choice</button></div></section></div>}
  </main><footer><span>AI MYSTERY ROOM</span><span>Every clue is fictional. Every answer is yours to find.</span></footer></>;
}
