import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, LayersControl, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import { API_BASE, getToken } from '../services/api';

// Fix Leaflet default-icon-path breakage under webpack (common React+Leaflet gotcha).
// We don't use the default icon directly (we use CircleMarker) but other consumers may.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const PRIORITY_COLOR = {
  high:   '#dc2626',
  medium: '#f59e0b',
  low:    '#0891b2',
};

export default function AnomalyMap() {
  const [data, setData] = useState({ drill_targets: [], geochem_samples: [] });
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const token = getToken();
        const r = await fetch(`${API_BASE}/custom-views/anomaly-map`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`);
        if (alive) setData(d);
      } catch (e) {
        if (alive) setErr(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) return <div className="ai-loading">Loading anomaly map...</div>;
  if (err) return <div className="ai-error">Map load failed: {err}</div>;

  const allPoints = [...data.drill_targets, ...data.geochem_samples];
  if (!allPoints.length) {
    return <div className="ai-empty">No geo-located targets or samples available.</div>;
  }

  // Center on centroid of all points
  const lat = allPoints.reduce((s, p) => s + p.lat, 0) / allPoints.length;
  const lng = allPoints.reduce((s, p) => s + p.lng, 0) / allPoints.length;

  return (
    <div className="custom-view-panel">
      <h3 style={{ margin: '0 0 8px', color: '#f1f5f9' }}>Anomaly Cluster Map</h3>
      <p style={{ margin: '0 0 12px', color: '#94a3b8', fontSize: 13 }}>
        Drill targets (priority-coloured) and geochem samples (cyan) plotted on OSM tiles.
      </p>
      <div style={{ height: 500, borderRadius: 8, overflow: 'hidden', border: '1px solid #1e293b' }}>
        <MapContainer center={[lat, lng]} zoom={2} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LayersControl position="topright">
            <LayersControl.Overlay checked name={`Drill Targets (${data.drill_targets.length})`}>
              <LayerGroup>
                {data.drill_targets.map((t) => (
                  <CircleMarker
                    key={`t-${t.id}`}
                    center={[t.lat, t.lng]}
                    radius={8}
                    pathOptions={{
                      color: PRIORITY_COLOR[String(t.priority || '').toLowerCase()] || '#94a3b8',
                      fillOpacity: 0.75,
                      weight: 2,
                    }}
                  >
                    <Popup>
                      <div style={{ minWidth: 180 }}>
                        <strong>{t.name}</strong><br />
                        <small>{t.id} - {t.property_id}</small><br />
                        Type: {t.target_type}<br />
                        Priority: {t.priority}<br />
                        Status: {t.status}
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </LayerGroup>
            </LayersControl.Overlay>
            <LayersControl.Overlay checked name={`Geochem Samples (${data.geochem_samples.length})`}>
              <LayerGroup>
                {data.geochem_samples.map((s) => (
                  <CircleMarker
                    key={`s-${s.id}`}
                    center={[s.lat, s.lng]}
                    radius={5}
                    pathOptions={{ color: '#22d3ee', fillOpacity: 0.6, weight: 1 }}
                  >
                    <Popup>
                      <div style={{ minWidth: 180 }}>
                        <strong>{s.id}</strong><br />
                        Type: {s.type}<br />
                        Property: {s.property_id}<br />
                        Status: {s.status}<br />
                        Location: {s.location}
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </LayerGroup>
            </LayersControl.Overlay>
          </LayersControl>
        </MapContainer>
      </div>
    </div>
  );
}
