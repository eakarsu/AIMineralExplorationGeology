import React, { useCallback, useEffect, useState } from 'react';
const BASE = (process.env.REACT_APP_API_BASE || 'http://localhost:3081/api') + '/feature-pack';
const TOKEN_KEY = 'meg_token';
const AI_FEATURES = [["drill-target-priority", "Drill Target Priority"], ["assay-anomalies", "Assay Anomalies"], ["permit-risk", "Permit Risk"]];
function renderValue(v) {
  if (v === null || v === undefined || v === '') return '(empty)';
  if (v === false) return 'false';
  if (v === 0) return '0';
  if (Array.isArray(v)) return v.length ? v.join(', ') : '(empty)';
  if (typeof v === 'object') return Object.entries(v).map(([k, val]) => `${k}: ${renderValue(val)}`).join(' | ') || '(empty)';
  return String(v);
}
export default function FeaturePackPage() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [aiResults, setAiResults] = useState({});
  const headers = () => ({ 'Content-Type': 'application/json', ...(localStorage.getItem(TOKEN_KEY) ? { Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}` } : {}) });
  const load = useCallback(async () => {
    try {
      const q = new URLSearchParams(); if (search) q.set('search', search); if (status) q.set('status', status);
      const res = await fetch(`${BASE}/tasks?${q}`, { headers: headers() });
      const data = await res.json(); setTasks(data.data || []); setError('');
    } catch (e) { setError(String(e.message || e)); }
  }, [search, status]);
  useEffect(() => { load(); }, [load]);
  async function createTask(e) { e.preventDefault(); const res = await fetch(`${BASE}/tasks`, { method: 'POST', headers: headers(), body: JSON.stringify({ title, description }) }); if (res.ok) { setTitle(''); setDescription(''); load(); } else { const d = await res.json().catch(() => ({})); setError(d.error || 'Create failed'); } }
  async function markDone(t) { await fetch(`${BASE}/tasks/${t.id}`, { method: 'PUT', headers: headers(), body: JSON.stringify({ status: 'done' }) }); load(); }
  async function runAi(slug) { const res = await fetch(`${BASE}/ai/${slug}`, { method: 'POST', headers: headers(), body: JSON.stringify({}) }); const data = await res.json(); setAiResults((p) => ({ ...p, [slug]: data })); }
  function download(kind) { const q = new URLSearchParams(); if (search) q.set('search', search); if (status) q.set('status', status); fetch(`${BASE}/tasks/export.${kind}?${q}`, { headers: headers() }).then((r) => r.blob()).then((b) => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `tasks.${kind}`; a.click(); }); }
  return (
    <main style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <h1>Feature Pack — Tasks &amp; Domain AI</h1>
      {error ? <p role="alert">{error}</p> : null}
      <section aria-label="Task search and filter"><h2>Search &amp; Filter</h2>
        <label>Search <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks" /></label>{' '}
        <label>Status <select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All</option><option value="todo">todo</option><option value="done">done</option></select></label>{' '}
        <button onClick={() => download('csv')}>Export CSV</button>{' '}<button onClick={() => download('json')}>Export JSON</button>
      </section>
      <section aria-label="Create task"><h2>Create Task</h2>
        <form onSubmit={createTask}><label>Title <input value={title} onChange={(e) => setTitle(e.target.value)} required /></label>{' '}<label>Description <input value={description} onChange={(e) => setDescription(e.target.value)} /></label>{' '}<button type="submit">Create</button></form>
      </section>
      <section aria-label="Tasks list"><h2>Tasks ({tasks.length})</h2>
        {tasks.length === 0 ? <p>(empty) — no tasks yet</p> : <ul>{tasks.map((t) => <li key={t.id}><strong>{renderValue(t.title)}</strong> — {renderValue(t.description)} — status: {renderValue(t.status)} — priority: {renderValue(t.priority)} {t.status !== 'done' ? <button onClick={() => markDone(t)}>Mark done</button> : null}</li>)}</ul>}
      </section>
      <section aria-label="Domain AI features"><h2>Domain AI (deterministic fallback)</h2>
        {AI_FEATURES.map(([slug, label]) => (
          <div key={slug}><h3>{label}</h3><button onClick={() => runAi(slug)}>Run {label}</button>
            {aiResults[slug] ? <div><p>Label: {renderValue(aiResults[slug].label)} | aiGenerated: {renderValue(aiResults[slug].aiGenerated)} | mode: {renderValue(aiResults[slug].mode)}</p>
            {Object.entries(aiResults[slug].sections || {}).map(([name, sec]) => <section key={name} aria-label={name}><h4>{name}</h4><p>{renderValue(sec)}</p></section>)}</div> : null}
          </div>))}
      </section>
    </main>
  );
}
