import React, { useState } from 'react';
import { getBlockModel, buildBlockModel } from '../services/api';

// 3D block-model viewer — implemented as a per-Z-slice 2D heatmap fallback.
// The backend returns nz[ny[nx[ normalized_grade ]]]; we render each Z slice
// as a coloured grid so the user can scrub through depth.
function colourFor(v) {
  // 0..1 normalized grade → cool-to-hot ramp
  if (v == null || isNaN(v)) v = 0;
  const t = Math.max(0, Math.min(1, v));
  const r = Math.round(255 * t);
  const g = Math.round(120 * (1 - Math.abs(0.5 - t) * 2));
  const b = Math.round(255 * (1 - t));
  return `rgb(${r},${g},${b})`;
}

export default function BlockModelViewerPage() {
  const [propertyId, setPropertyId] = useState('PROP-CA-001');
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [zSlice, setZSlice] = useState(0);

  const load = async () => {
    setLoading(true); setErr(null); setModel(null);
    try {
      const m = await getBlockModel(propertyId);
      setModel(m);
      setZSlice(Math.floor((m.nz || 1) / 2));
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const build = async () => {
    setLoading(true); setErr(null);
    try {
      const m = await buildBlockModel({ property_id: propertyId });
      setModel(m);
      setZSlice(Math.floor((m.nz || 1) / 2));
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const grid = model && Array.isArray(model.grid) ? model.grid : null;
  const slice = grid && grid[zSlice] ? grid[zSlice] : null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>3D Block-Model Viewer</h2>
          <p>Coarse 3D voxel grid synthesized from drill-hole assay data. Rendered as a
            per-depth 2D heatmap fallback (true 3D viewer is the product decision pending).</p>
        </div>
        <div className="page-header-actions">
          <button className="btn secondary" onClick={load} disabled={loading || !propertyId}>Load Latest</button>
          <button className="btn" onClick={build} disabled={loading || !propertyId}>Build / Rebuild</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="form-group">
          <label>Property ID</label>
          <input
            type="text"
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            placeholder="e.g. PROP-CA-001"
          />
        </div>
      </div>

      {err && <div className="ai-error">{err}</div>}
      {loading && <div className="empty-state">Loading...</div>}

      {model && (
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: '#94a3b8' }}>
            <span>Model: <strong style={{ color: '#fff' }}>{model.model_id}</strong></span>
            <span>Property: {model.property_id}</span>
            <span>Grid: {model.nx} × {model.ny} × {model.nz}</span>
            <span>Block size: {model.block_size_m} m</span>
            {model.commodity && <span>Commodity: {model.commodity}</span>}
            {model.source && <span>Source: {model.source}</span>}
          </div>
          {model.notes && <p style={{ marginTop: 8, fontSize: 12, color: '#94a3b8' }}>{model.notes}</p>}
        </div>
      )}

      {slice && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <label style={{ fontWeight: 600 }}>Depth slice z = {zSlice} of {model.nz - 1}</label>
            <input
              type="range"
              min={0}
              max={(model.nz || 1) - 1}
              value={zSlice}
              onChange={(e) => setZSlice(parseInt(e.target.value, 10) || 0)}
              style={{ flex: 1 }}
            />
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${model.nx}, 1fr)`,
            gap: 1,
            background: '#0b1424',
            padding: 4,
            borderRadius: 8,
            maxWidth: 720,
          }}>
            {slice.flatMap((row, y) =>
              row.map((v, x) => (
                <div
                  key={`${x}-${y}`}
                  title={`x=${x} y=${y} z=${zSlice}  grade=${v}`}
                  style={{
                    aspectRatio: '1 / 1',
                    background: colourFor(v),
                    minWidth: 8,
                  }}
                />
              ))
            )}
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>
            Hot (red) = high normalized grade. Cool (blue) = background. Synthesized via inverse-distance
            from drill-hole assay maxima — not a substitute for proper estimation software.
          </div>
        </div>
      )}

      {!loading && model && !slice && (
        <div className="empty-state">Block model has no grid data.</div>
      )}
    </div>
  );
}
