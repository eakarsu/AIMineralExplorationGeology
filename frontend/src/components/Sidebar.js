import React from 'react';
import { NavLink } from 'react-router-dom';
import { logout, getStoredUser } from '../services/api';

// Sidebar groups requested:
// Overview / Properties / Drilling / Geophysics / Geochem / Permits / Stakeholders /
// Resources / Governance / AI Exploration / AI Reporting / Admin
const PROPERTIES_LINKS = [
  { to: '/properties',  label: 'Properties' },
  { to: '/claims',      label: 'Claims' },
];

const DRILLING_LINKS = [
  { to: '/drill-holes',      label: 'Drill Holes' },
  { to: '/assay-results',    label: 'Assay Results' },
  { to: '/geological-logs',  label: 'Geological Logs' },
  { to: '/drill-targets',    label: 'Drill Targets' },
];

const GEOPHYSICS_LINKS = [
  { to: '/geophysics-surveys', label: 'Geophysics Surveys' },
];

const GEOCHEM_LINKS = [
  { to: '/geochem-samples',    label: 'Geochem Samples' },
  { to: '/samples-inventory',  label: 'Samples Inventory' },
];

const PERMITS_LINKS = [
  { to: '/permits',                label: 'Permits' },
  { to: '/environmental-impacts',  label: 'Environmental Impacts' },
];

const STAKEHOLDERS_LINKS = [
  { to: '/indigenous-consultations', label: 'Indigenous Consultations' },
  { to: '/partners',                 label: 'Partners / JVs' },
  { to: '/geologists',               label: 'Geologists' },
  { to: '/contractors',              label: 'Contractors' },
];

const RESOURCES_LINKS = [
  { to: '/ndp-resource-estimates', label: 'NI 43-101 Estimates' },
  { to: '/expense-reports',        label: 'Expense Reports' },
];

const GOVERNANCE_LINKS = [
  { to: '/audit-log', label: 'Audit Log' },
];

const AI_EXPLORATION_LINKS = [
  { to: '/ai/anomaly-cluster',           label: 'AI · Anomaly Cluster' },
  { to: '/ai/drill-target-rank',         label: 'AI · Drill Target Rank' },
  { to: '/ai/assay-trend',               label: 'AI · Assay Trend' },
  { to: '/ai/geochem-pathfinder-detect', label: 'AI · Geochem Pathfinder' },
  { to: '/ai/geophysics-interpretation', label: 'AI · Geophysics Interp.' },
  { to: '/ai/geologist-shift-plan',      label: 'AI · Geologist Shift Plan' },
  { to: '/ai/vendor-quote-compare',      label: 'AI · Vendor Quote Compare' },
  { to: '/ai/exploration-budget',        label: 'AI · Exploration Budget' },
];

const AI_REPORTING_LINKS = [
  { to: '/ai/executive-brief',          label: 'AI · Executive Brief' },
  { to: '/ai/ndp-43-101-summary',       label: 'AI · NI 43-101 Summary' },
  { to: '/ai/resource-statement-draft', label: 'AI · Resource Statement' },
  { to: '/ai/permit-readiness',         label: 'AI · Permit Readiness' },
  { to: '/ai/environmental-risk-brief', label: 'AI · Environmental Risk' },
  { to: '/ai/indigenous-engagement-plan',label: 'AI · Indigenous Plan' },
  { to: '/ai/partner-pitch-draft',      label: 'AI · Partner Pitch' },
  { to: '/ai/jurisdictional-risk',      label: 'AI · Jurisdictional Risk' },
];

export default function Sidebar() {
  const user = getStoredUser();
  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <h1>MINEXPLORE</h1>
        <p>Junior Mining Exploration Hub</p>
      </div>

      <div className="sidebar-group-label">Overview</div>
      <NavLink to="/" end>Exploration Dashboard</NavLink>

      <div className="sidebar-group-label">Properties</div>
      {PROPERTIES_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">Drilling</div>
      {DRILLING_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">Geophysics</div>
      {GEOPHYSICS_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">Geochem</div>
      {GEOCHEM_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">Permits</div>
      {PERMITS_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">Stakeholders</div>
      {STAKEHOLDERS_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">Resources</div>
      {RESOURCES_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">Governance</div>
      {GOVERNANCE_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">AI Exploration</div>
      {AI_EXPLORATION_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">AI Reporting</div>
      {AI_REPORTING_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">Custom Views</div>
      <NavLink to="/custom-views">Exploration Views</NavLink>

      <div className="sidebar-group-label">Admin</div>
      <NavLink to="/webhooks">Webhooks</NavLink>

      <div className="sidebar-user">
        {user && (
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user.name || user.email}</div>
            <div className="sidebar-user-role">{user.role || 'user'}</div>
          </div>
        )}
        <button className="btn secondary sidebar-logout" onClick={logout}>Sign Out</button>
      </div>
    </nav>
  );
}
