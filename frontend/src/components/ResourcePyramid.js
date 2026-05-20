import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts';
import { API_BASE, getToken } from '../services/api';

// Resource Estimate Pyramid
// Renders Measured (widest) > Indicated > Inferred (narrowest) as a horizontal
// pyramid. Uses recharts BarChart with layout="vertical" and Cell colouring.
const CATEGORY_COLOR = {
  Measured:  '#10b981', // emerald (highest confidence)
  Indicated: '#3b82f6', // blue
  Inferred:  '#a78bfa', // violet (lowest confidence)
};

function fmtTonnes(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)} Mt`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(2)} kt`;
  return `${Number(n).toLocaleString()} t`;
}

export default function ResourcePyramid() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const token = getToken();
        const r = await fetch(`${API_BASE}/custom-views/resource-pyramid`, {
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

  if (loading) return <div className="ai-loading">Loading resource pyramid...</div>;
  if (err) return <div className="ai-error">Pyramid load failed: {err}</div>;
  if (!rows.length || rows.every((r) => !r.tonnes)) {
    return <div className="ai-empty">No NI 43-101 resource estimates available.</div>;
  }

  return (
    <div className="custom-view-panel">
      <h3 style={{ margin: '0 0 8px', color: '#f1f5f9' }}>NI 43-101 Resource Pyramid</h3>
      <p style={{ margin: '0 0 12px', color: '#94a3b8', fontSize: 13 }}>
        Pyramid sums tonnes by category. Measured = highest geological confidence; Inferred = lowest.
      </p>
      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={rows} layout="vertical" margin={{ top: 16, right: 96, left: 32, bottom: 16 }}>
          <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
          <XAxis
            type="number"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickFormatter={fmtTonnes}
          />
          <YAxis
            type="category"
            dataKey="category"
            tick={{ fill: '#cbd5e1', fontSize: 13, fontWeight: 600 }}
            width={100}
          />
          <Tooltip
            contentStyle={{ background: '#0f1a2e', border: '1px solid #1e293b', color: '#e2e8f0' }}
            formatter={(v, k, ctx) => {
              if (k === 'tonnes') return [fmtTonnes(v), 'Tonnes'];
              if (k === 'grade') return [Number(v).toFixed(3), 'Avg grade'];
              return [v, k];
            }}
          />
          <Bar dataKey="tonnes" name="Tonnes" barSize={42}>
            {rows.map((r) => (
              <Cell key={r.category} fill={CATEGORY_COLOR[r.category] || '#64748b'} />
            ))}
            <LabelList
              dataKey="tonnes"
              position="right"
              fill="#e2e8f0"
              fontSize={12}
              formatter={(v) => fmtTonnes(v)}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div style={{ marginTop: 12, color: '#94a3b8', fontSize: 12 }}>
        Deposits per category: {rows.map((r) => `${r.category}: ${r.deposits}`).join(' | ')}
      </div>
    </div>
  );
}
