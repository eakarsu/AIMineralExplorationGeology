import React, { useEffect, useState } from 'react';
import { claimLedgerApi, canWrite } from '../services/api';

const EVENT_TYPES = ['transfer', 'status_change', 'renewal', 'surrender', 'stake', 'amendment'];

export default function ClaimLedgerPage() {
  const writer = canWrite();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [filterClaim, setFilterClaim] = useState('');
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({
    claim_id: '',
    property_id: '',
    event_type: 'transfer',
    from_party: '',
    to_party: '',
    prev_status: '',
    next_status: '',
    effective_date: '',
    reference: '',
    notes: '',
  });

  const load = async () => {
    setLoading(true); setErr(null);
    try {
      const params = filterClaim ? { claim_id: filterClaim } : {};
      const data = await claimLedgerApi.list(params);
      setRows(Array.isArray(data) ? data : []);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const setField = (k, v) => setDraft((d) => ({ ...d, [k]: v }));

  const submit = async () => {
    try {
      await claimLedgerApi.create(draft);
      setCreating(false);
      setDraft({
        claim_id: '', property_id: '', event_type: 'transfer',
        from_party: '', to_party: '', prev_status: '', next_status: '',
        effective_date: '', reference: '', notes: '',
      });
      load();
    } catch (e) { alert(e.message); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Claim Ledger</h2>
          <p>Immutable transfer / status-change history for mineral claims. Append-only — entries cannot be edited or deleted.</p>
        </div>
        <div className="page-header-actions">
          {writer && (
            <button className="btn" onClick={() => setCreating(true)}>+ Record Event</button>
          )}
        </div>
      </div>

      <div className="toolbar">
        <input
          className="search-input"
          type="text"
          placeholder="Filter by claim_id..."
          value={filterClaim}
          onChange={(e) => setFilterClaim(e.target.value)}
        />
        <button className="btn secondary" onClick={load} style={{ marginLeft: 8 }}>Apply</button>
        <div className="toolbar-meta">{rows.length} entr{rows.length === 1 ? 'y' : 'ies'}</div>
      </div>

      {err && <div className="ai-error">Failed to load: {err}</div>}

      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : rows.length === 0 ? (
        <div className="empty-state">No ledger entries yet.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>When</th>
                <th>Claim</th>
                <th>Property</th>
                <th>Event</th>
                <th>From</th>
                <th>To</th>
                <th>Status: prev → next</th>
                <th>Effective</th>
                <th>Reference</th>
                <th>Recorded By</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.created_at ? new Date(r.created_at).toLocaleString() : '—'}</td>
                  <td><strong>{r.claim_id}</strong></td>
                  <td>{r.property_id || '—'}</td>
                  <td><span className={`badge ${String(r.event_type).toLowerCase()}`}>{r.event_type}</span></td>
                  <td>{r.from_party || '—'}</td>
                  <td>{r.to_party || '—'}</td>
                  <td>{(r.prev_status || '—') + ' → ' + (r.next_status || '—')}</td>
                  <td>{r.effective_date || '—'}</td>
                  <td>{r.reference || '—'}</td>
                  <td>{r.recorded_by || '—'}</td>
                  <td>{r.notes ? (r.notes.length > 80 ? r.notes.slice(0, 80) + '…' : r.notes) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {creating && (
        <div className="modal-overlay" onClick={() => setCreating(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Record Claim Ledger Event</h3>
              <button className="modal-close" onClick={() => setCreating(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Claim ID *</label>
                  <input type="text" value={draft.claim_id} onChange={(e) => setField('claim_id', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Property ID</label>
                  <input type="text" value={draft.property_id} onChange={(e) => setField('property_id', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Event Type *</label>
                  <select value={draft.event_type} onChange={(e) => setField('event_type', e.target.value)}>
                    {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>From Party</label>
                  <input type="text" value={draft.from_party} onChange={(e) => setField('from_party', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>To Party</label>
                  <input type="text" value={draft.to_party} onChange={(e) => setField('to_party', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Prev Status</label>
                  <input type="text" value={draft.prev_status} onChange={(e) => setField('prev_status', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Next Status</label>
                  <input type="text" value={draft.next_status} onChange={(e) => setField('next_status', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Effective Date</label>
                  <input type="date" value={draft.effective_date} onChange={(e) => setField('effective_date', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Reference</label>
                  <input type="text" value={draft.reference} onChange={(e) => setField('reference', e.target.value)} />
                </div>
                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea value={draft.notes} onChange={(e) => setField('notes', e.target.value)} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn secondary" onClick={() => setCreating(false)}>Cancel</button>
              <button className="btn" onClick={submit} disabled={!draft.claim_id || !draft.event_type}>Record</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
