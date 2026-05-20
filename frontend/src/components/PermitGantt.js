import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, Cell,
} from 'recharts';
import { API_BASE, getToken } from '../services/api';

// Permit Status Gantt
// Each permit = one horizontal bar from issued_at over a fixed 24-month window.
// Implemented via recharts BarChart layout="vertical" + a transparent
// offset bar + a coloured duration bar (the standard recharts gantt trick).
const STATUS_COLOR = {
  approved: '#10b981',
  active:   '#10b981',
  pending:  '#f59e0b',
  draft:    '#64748b',
  expired:  '#dc2626',
  rejected: '#dc2626',
};

function dayToISO(d) {
  return new Date(d * 24 * 3600 * 1000).toISOString().slice(0, 10);
}

export default function PermitGantt() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const token = getToken();
        const r = await fetch(`${API_BASE}/custom-views/permit-gantt`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`);
        if (alive) setRows(Array.isArray(d) ? d : []);
      } catch (e) {
        if (alive) setErr(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) return <div className="ai-loading">Loading permit Gantt...</div>;
  if (err) return <div className="ai-error">Gantt load failed: {err}</div>;
  if (!rows.length) return <div className="ai-empty">No permits available.</div>;

  // Use day-since-epoch as x-axis. Compute global min so we can shift bars.
  const minStart = Math.min(...rows.map((r) => r.start_day));
  const data = rows.map((r) => ({
    ...r,
    label: `${r.permit_id} (${r.type || 'permit'})`,
    offset: r.start_day - minStart,
    length: r.length_days,
  }));

  return (
    <div className="custom-view-panel">
      <h3 style={{ margin: '0 0 8px', color: '#f1f5f9' }}>Permit Status Gantt</h3>
      <p style={{ margin: '0 0 12px', color: '#94a3b8', fontSize: 13 }}>
        Each bar spans from <code>issued_at</code> across a 24-month assumed validity window.
        Bar colour = current permit status.
      </p>
      <ResponsiveContainer width="100%" height={Math.max(300, rows.length * 28 + 80)}>
        <BarChart data={data} layout="vertical" margin={{ top: 16, right: 24, left: 32, bottom: 24 }} stackOffset="none">
          <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
          <XAxis
            type="number"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickFormatter={(d) => dayToISO(d + minStart)}
            domain={[0, 'dataMax']}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fill: '#cbd5e1', fontSize: 11 }}
            width={220}
          />
          <Tooltip
            contentStyle={{ background: '#0f1a2e', border: '1px solid #1e293b', color: '#e2e8f0' }}
            formatter={(v, name, ctx) => {
              if (name === 'length') {
                const row = ctx.payload;
                return [`${row.start_iso} -> ${row.end_iso}`, 'Window'];
              }
              return null;
            }}
            labelFormatter={(label) => label}
          />
          {/* invisible offset bar to push start to issued_at */}
          <Bar dataKey="offset" stackId="g" fill="transparent" isAnimationActive={false} />
          {/* visible duration bar, coloured by status */}
          <Bar dataKey="length" stackId="g" name="Validity window">
            {data.map((r) => (
              <Cell
                key={r.permit_id}
                fill={STATUS_COLOR[String(r.status || '').toLowerCase()] || '#3b82f6'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
