import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../services/api';

const FEATURES = [
  { path: '/properties',                title: 'Properties',                icon: 'P',  color: '#f59e0b', desc: 'Exploration properties under management.' },
  { path: '/claims',                    title: 'Claims',                    icon: 'C',  color: '#fbbf24', desc: 'Mineral claims, expiry, area in hectares.' },
  { path: '/drill-holes',               title: 'Drill Holes',               icon: 'D',  color: '#3b82f6', desc: 'Diamond and RC drill holes by property.' },
  { path: '/assay-results',             title: 'Assay Results',             icon: 'A',  color: '#06b6d4', desc: 'Down-hole assays — Au, Ag, Cu, Ni, Li, REE.' },
  { path: '/geological-logs',           title: 'Geological Logs',           icon: 'L',  color: '#a78bfa', desc: 'Lithology and structural logs per hole.' },
  { path: '/drill-targets',             title: 'Drill Targets',             icon: 'T',  color: '#ec4899', desc: 'Proposed and approved drill targets.' },
  { path: '/geophysics-surveys',        title: 'Geophysics Surveys',        icon: 'Z',  color: '#60a5fa', desc: 'IP, EM, magnetics, gravity and CSAMT.' },
  { path: '/geochem-samples',           title: 'Geochem Samples',           icon: 'G',  color: '#a3e635', desc: 'Soil, rock chip, stream sediment and brine.' },
  { path: '/samples-inventory',         title: 'Samples Inventory',         icon: 'S',  color: '#7dd3fc', desc: 'Chain-of-custody across camps and labs.' },
  { path: '/permits',                   title: 'Permits',                   icon: 'M',  color: '#22c55e', desc: 'Authority, type, status by jurisdiction.' },
  { path: '/environmental-impacts',     title: 'Environmental Impacts',     icon: 'E',  color: '#ef4444', desc: 'Open environmental flags and severity.' },
  { path: '/indigenous-consultations',  title: 'Indigenous Consultations',  icon: 'I',  color: '#facc15', desc: 'Community engagement and FPIC progress.' },
  { path: '/partners',                  title: 'Partners / JVs',            icon: 'J',  color: '#14b8a6', desc: 'Majors, off-takers, finance partners.' },
  { path: '/geologists',                title: 'Geologists',                icon: 'X',  color: '#fb7185', desc: 'In-house and rotational specialists.' },
  { path: '/contractors',               title: 'Contractors',               icon: 'K',  color: '#0ea5e9', desc: 'Drillers, labs, surveyors, consultants.' },
  { path: '/ndp-resource-estimates',    title: 'NI 43-101 Estimates',       icon: 'R',  color: '#34d399', desc: 'Tabletop resource categories and grade.' },
  { path: '/expense-reports',           title: 'Expense Reports',           icon: '$',  color: '#f472b6', desc: 'Quarterly exploration spend by category.' },
  { path: '/audit-log',                 title: 'Audit Log',                 icon: 'V',  color: '#94a3b8', desc: 'Actor / action / target governance trail.' },

  { path: '/ai/anomaly-cluster',            title: 'AI · Anomaly Cluster',          icon: '*', color: '#8b5cf6', desc: 'Cluster geochem/geophys anomalies.' },
  { path: '/ai/drill-target-rank',          title: 'AI · Drill Target Rank',        icon: '*', color: '#8b5cf6', desc: 'Rank targets against budget.' },
  { path: '/ai/ndp-43-101-summary',         title: 'AI · NI 43-101 Summary',        icon: '*', color: '#8b5cf6', desc: 'QP-style property technical summary.' },
  { path: '/ai/assay-trend',                title: 'AI · Assay Trend',              icon: '*', color: '#8b5cf6', desc: 'Down-hole / element grade trends.' },
  { path: '/ai/executive-brief',            title: 'AI · Executive Brief',          icon: '*', color: '#8b5cf6', desc: 'Board-level exploration snapshot.' },
  { path: '/ai/permit-readiness',           title: 'AI · Permit Readiness',         icon: '*', color: '#8b5cf6', desc: 'Score readiness against jurisdiction.' },
  { path: '/ai/environmental-risk-brief',   title: 'AI · Environmental Risk',       icon: '*', color: '#8b5cf6', desc: 'Risk drivers + mitigations per property.' },
  { path: '/ai/indigenous-engagement-plan', title: 'AI · Indigenous Plan',          icon: '*', color: '#8b5cf6', desc: 'FPIC-aware community engagement plan.' },
  { path: '/ai/vendor-quote-compare',       title: 'AI · Vendor Quote Compare',     icon: '*', color: '#8b5cf6', desc: 'Compare drilling / lab / consulting bids.' },
  { path: '/ai/partner-pitch-draft',        title: 'AI · Partner Pitch',            icon: '*', color: '#8b5cf6', desc: 'Draft JV / off-take / financing pitch.' },
  { path: '/ai/exploration-budget',         title: 'AI · Exploration Budget',       icon: '*', color: '#8b5cf6', desc: 'Phased budget with inflection points.' },
  { path: '/ai/geologist-shift-plan',       title: 'AI · Geologist Shift Plan',     icon: '*', color: '#8b5cf6', desc: 'FIFO rotation coverage planner.' },
  { path: '/ai/geochem-pathfinder-detect',  title: 'AI · Geochem Pathfinder',       icon: '*', color: '#8b5cf6', desc: 'Pathfinder elements for target commodity.' },
  { path: '/ai/geophysics-interpretation',  title: 'AI · Geophysics Interp.',       icon: '*', color: '#8b5cf6', desc: 'Interpret a survey and imply targets.' },
  { path: '/ai/resource-statement-draft',   title: 'AI · Resource Statement',       icon: '*', color: '#8b5cf6', desc: 'Draft tabletop mineral resource statement.' },
  { path: '/ai/jurisdictional-risk',        title: 'AI · Jurisdictional Risk',      icon: '*', color: '#8b5cf6', desc: 'Country-level mining risk profile.' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    getDashboardStats().then(setStats).catch((e) => setErr(e.message));
  }, []);

  return (
    <div>
      <div className="dashboard-header">
        <h2>Exploration Dashboard</h2>
        <p>Junior mining exploration command picture · {new Date().toUTCString()}</p>
      </div>

      {err && <div className="ai-error">Stats unavailable: {err}</div>}

      {stats && (
        <div className="stats-grid">
          <div className="stat"><div className="stat-label">Properties</div><div className="stat-value">{stats.properties?.total ?? '—'}</div><div className="stat-sub">{stats.properties?.active ?? 0} active · {stats.properties?.permitting ?? 0} permitting</div></div>
          <div className="stat"><div className="stat-label">Claims (ha)</div><div className="stat-value">{stats.claims?.total ?? '—'}</div><div className="stat-sub">{Number(stats.claims?.total_area_ha || 0).toLocaleString()} ha · {stats.claims?.pending_renewal ?? 0} renew</div></div>
          <div className="stat"><div className="stat-label">Drill Holes</div><div className="stat-value">{stats.drill_holes?.total ?? '—'}</div><div className="stat-sub">{stats.drill_holes?.in_progress ?? 0} active · {Number(stats.drill_holes?.total_depth_m || 0).toLocaleString()} m</div></div>
          <div className="stat"><div className="stat-label">Assays</div><div className="stat-value">{stats.assay_results?.total ?? '—'}</div><div className="stat-sub">{stats.assay_results?.au_high ?? 0} high-grade Au</div></div>
          <div className="stat"><div className="stat-label">Geophysics</div><div className="stat-value">{stats.geophysics_surveys?.total ?? '—'}</div><div className="stat-sub">{stats.geophysics_surveys?.completed ?? 0} completed</div></div>
          <div className="stat"><div className="stat-label">Geochem</div><div className="stat-value">{stats.geochem_samples?.total ?? '—'}</div><div className="stat-sub">{stats.geochem_samples?.analyzed ?? 0} analyzed · {stats.geochem_samples?.pending ?? 0} pending</div></div>
          <div className="stat"><div className="stat-label">Logs</div><div className="stat-value">{stats.geological_logs?.total ?? '—'}</div><div className="stat-sub">lithology intervals</div></div>
          <div className="stat"><div className="stat-label">Geologists</div><div className="stat-value">{stats.geologists?.total ?? '—'}</div><div className="stat-sub">{stats.geologists?.active ?? 0} active · {stats.geologists?.on_rotation ?? 0} rotating</div></div>
          <div className="stat"><div className="stat-label">Contractors</div><div className="stat-value">{stats.contractors?.total ?? '—'}</div><div className="stat-sub">{stats.contractors?.approved ?? 0} approved</div></div>
          <div className="stat"><div className="stat-label">Inventory</div><div className="stat-value">{stats.samples_inventory?.total ?? '—'}</div><div className="stat-sub">{stats.samples_inventory?.in_transit ?? 0} in transit · {stats.samples_inventory?.pending ?? 0} pending</div></div>
          <div className="stat"><div className="stat-label">Permits</div><div className="stat-value">{stats.permits?.total ?? '—'}</div><div className="stat-sub">{stats.permits?.issued ?? 0} issued · {stats.permits?.pending ?? 0} pending · {stats.permits?.denied ?? 0} denied</div></div>
          <div className="stat"><div className="stat-label">Environmental</div><div className="stat-value">{stats.environmental_impacts?.total ?? '—'}</div><div className="stat-sub">{stats.environmental_impacts?.critical ?? 0} critical · {stats.environmental_impacts?.high ?? 0} high</div></div>
          <div className="stat"><div className="stat-label">Consults</div><div className="stat-value">{stats.indigenous_consultations?.total ?? '—'}</div><div className="stat-sub">{stats.indigenous_consultations?.in_progress ?? 0} in progress</div></div>
          <div className="stat"><div className="stat-label">Targets</div><div className="stat-value">{stats.drill_targets?.total ?? '—'}</div><div className="stat-sub">{stats.drill_targets?.approved ?? 0} approved · {stats.drill_targets?.critical ?? 0} critical</div></div>
          <div className="stat"><div className="stat-label">Resources</div><div className="stat-value">{stats.ndp_resource_estimates?.total ?? '—'}</div><div className="stat-sub">{stats.ndp_resource_estimates?.measured ?? 0} M · {stats.ndp_resource_estimates?.indicated ?? 0} I · {stats.ndp_resource_estimates?.inferred ?? 0} Inf</div></div>
          <div className="stat"><div className="stat-label">Spend (USD)</div><div className="stat-value">{stats.expense_reports?.total ?? '—'}</div><div className="stat-sub">${Number(stats.expense_reports?.total_usd || 0).toLocaleString()}</div></div>
          <div className="stat"><div className="stat-label">Partners</div><div className="stat-value">{stats.partners?.total ?? '—'}</div><div className="stat-sub">{stats.partners?.active ?? 0} active</div></div>
          <div className="stat"><div className="stat-label">Audit</div><div className="stat-value">{stats.audit_log?.total ?? '—'}</div><div className="stat-sub">governance entries</div></div>
        </div>
      )}

      <h3 style={{ color: '#cbd5e1', margin: '8px 0 14px', fontSize: 15, textTransform: 'uppercase', letterSpacing: 1 }}>Capabilities</h3>
      <div className="feature-grid">
        {FEATURES.map((f) => (
          <div
            key={f.path}
            className="feature-card"
            style={{ ['--card-color']: f.color }}
            onClick={() => navigate(f.path)}
          >
            <div className="feature-card-icon" style={{ background: f.color + '22', color: f.color }}>{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
