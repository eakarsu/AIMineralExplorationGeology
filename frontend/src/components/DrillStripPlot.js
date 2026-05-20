import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  ResponsiveContainer, LabelList,
} from 'recharts';
import { API_BASE, getToken } from '../services/api';

// Drill Hole Strip Plot
// x-axis: hole_id, vertical strips composed of stacked grade-range buckets.
// Each bar segment height = count of assay intervals in that grade bucket.
const GRADE_COLORS = {
  low:     '#1e3a8a', // navy
  mid:     '#0891b2', // cyan
  high:    '#f59e0b', // amber
  bonanza: '#dc2626', // red
};

export default function DrillStripPlot() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const token = getToken();
        const r = await fetch(`${API_BASE}/custom-views/drill-strip`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
        if (alive) setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        if (alive) setErr(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) return <div className="ai-loading">Loading drill strip plot...</div>;
  if (err) return <div className="ai-error">Strip plot failed: {err}</div>;
  if (!rows.length) return <div className="ai-empty">No assay-bearing drill holes available.</div>;

  return (
    <div className="custom-view-panel">
      <h3 style={{ margin: '0 0 8px', color: '#f1f5f9' }}>Drill Hole Strip Plot</h3>
      <p style={{ margin: '0 0 12px', color: '#94a3b8', fontSize: 13 }}>
        Each vertical strip = one drill hole. Segments stack from low-grade (navy) at base to bonanza
        (red) at top.
      </p>
      <ResponsiveContainer width="100%" height={420}>
        <BarChart data={rows} margin={{ top: 16, right: 24, left: 0, bottom: 60 }}>
          <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
          <XAxis
            dataKey="hole_id"
            angle={-45}
            textAnchor="end"
            interval={0}
            height={80}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
          />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'Intervals', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
          <Tooltip
            contentStyle={{ background: '#0f1a2e', border: '1px solid #1e293b', color: '#e2e8f0' }}
            formatter={(v, k) => [v, k]}
          />
          <Legend wrapperStyle={{ color: '#cbd5e1' }} />
          <Bar dataKey="low"     stackId="g" fill={GRADE_COLORS.low}     name="Low (< 0.5)" />
          <Bar dataKey="mid"     stackId="g" fill={GRADE_COLORS.mid}     name="Mid (0.5–2)" />
          <Bar dataKey="high"    stackId="g" fill={GRADE_COLORS.high}    name="High (2–10)" />
          <Bar dataKey="bonanza" stackId="g" fill={GRADE_COLORS.bonanza} name="Bonanza (≥ 10)">
            <LabelList dataKey="peak_element" position="top" fill="#fca5a5" fontSize={10} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
