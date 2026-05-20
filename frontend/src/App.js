import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';

// 18 CRUD pages
import PropertiesPage              from './pages/PropertiesPage';
import ClaimsPage                  from './pages/ClaimsPage';
import DrillHolesPage              from './pages/DrillHolesPage';
import AssayResultsPage            from './pages/AssayResultsPage';
import GeophysicsSurveysPage       from './pages/GeophysicsSurveysPage';
import GeochemSamplesPage          from './pages/GeochemSamplesPage';
import GeologicalLogsPage          from './pages/GeologicalLogsPage';
import GeologistsPage              from './pages/GeologistsPage';
import ContractorsPage             from './pages/ContractorsPage';
import SamplesInventoryPage        from './pages/SamplesInventoryPage';
import PermitsPage                 from './pages/PermitsPage';
import EnvironmentalImpactsPage    from './pages/EnvironmentalImpactsPage';
import IndigenousConsultationsPage from './pages/IndigenousConsultationsPage';
import DrillTargetsPage            from './pages/DrillTargetsPage';
import NdpResourceEstimatesPage    from './pages/NdpResourceEstimatesPage';
import ExpenseReportsPage          from './pages/ExpenseReportsPage';
import PartnersPage                from './pages/PartnersPage';
import AuditLogPage                from './pages/AuditLogPage';

// 16 AI pages
import AIAnomalyClusterPage           from './pages/AIAnomalyClusterPage';
import AIDrillTargetRankPage          from './pages/AIDrillTargetRankPage';
import AINdp43101SummaryPage          from './pages/AINdp43101SummaryPage';
import AIAssayTrendPage               from './pages/AIAssayTrendPage';
import AIExecutiveBriefPage           from './pages/AIExecutiveBriefPage';
import AIPermitReadinessPage          from './pages/AIPermitReadinessPage';
import AIEnvironmentalRiskPage        from './pages/AIEnvironmentalRiskPage';
import AIIndigenousEngagementPage     from './pages/AIIndigenousEngagementPage';
import AIVendorQuoteComparePage       from './pages/AIVendorQuoteComparePage';
import AIPartnerPitchPage             from './pages/AIPartnerPitchPage';
import AIExplorationBudgetPage        from './pages/AIExplorationBudgetPage';
import AIGeologistShiftPlanPage       from './pages/AIGeologistShiftPlanPage';
import AIGeochemPathfinderPage        from './pages/AIGeochemPathfinderPage';
import AIGeophysicsInterpretationPage from './pages/AIGeophysicsInterpretationPage';
import AIResourceStatementPage        from './pages/AIResourceStatementPage';
import AIJurisdictionalRiskPage       from './pages/AIJurisdictionalRiskPage';

// Admin
import WebhooksPage from './pages/WebhooksPage';

// Custom Exploration Views (4 specialised visualisations)
import CustomViewsPage from './pages/CustomViewsPage';

import LoginPage from './pages/LoginPage';
import { getToken } from './services/api';

import './App.css';

function RequireAuth({ children }) {
  const location = useLocation();
  if (!getToken()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

function ShellRoutes() {
  return (
    <div className="app">
      <Sidebar />
      <main className="main" style={{ padding: 0 }}>
        <Topbar />
        <div style={{ padding: '24px 32px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />

            <Route path="/properties"               element={<PropertiesPage />} />
            <Route path="/claims"                   element={<ClaimsPage />} />
            <Route path="/drill-holes"              element={<DrillHolesPage />} />
            <Route path="/assay-results"            element={<AssayResultsPage />} />
            <Route path="/geophysics-surveys"       element={<GeophysicsSurveysPage />} />
            <Route path="/geochem-samples"          element={<GeochemSamplesPage />} />
            <Route path="/geological-logs"          element={<GeologicalLogsPage />} />
            <Route path="/geologists"               element={<GeologistsPage />} />
            <Route path="/contractors"              element={<ContractorsPage />} />
            <Route path="/samples-inventory"        element={<SamplesInventoryPage />} />
            <Route path="/permits"                  element={<PermitsPage />} />
            <Route path="/environmental-impacts"    element={<EnvironmentalImpactsPage />} />
            <Route path="/indigenous-consultations" element={<IndigenousConsultationsPage />} />
            <Route path="/drill-targets"            element={<DrillTargetsPage />} />
            <Route path="/ndp-resource-estimates"   element={<NdpResourceEstimatesPage />} />
            <Route path="/expense-reports"          element={<ExpenseReportsPage />} />
            <Route path="/partners"                 element={<PartnersPage />} />
            <Route path="/audit-log"                element={<AuditLogPage />} />

            <Route path="/ai/anomaly-cluster"            element={<AIAnomalyClusterPage />} />
            <Route path="/ai/drill-target-rank"          element={<AIDrillTargetRankPage />} />
            <Route path="/ai/ndp-43-101-summary"         element={<AINdp43101SummaryPage />} />
            <Route path="/ai/assay-trend"                element={<AIAssayTrendPage />} />
            <Route path="/ai/executive-brief"            element={<AIExecutiveBriefPage />} />
            <Route path="/ai/permit-readiness"           element={<AIPermitReadinessPage />} />
            <Route path="/ai/environmental-risk-brief"   element={<AIEnvironmentalRiskPage />} />
            <Route path="/ai/indigenous-engagement-plan" element={<AIIndigenousEngagementPage />} />
            <Route path="/ai/vendor-quote-compare"       element={<AIVendorQuoteComparePage />} />
            <Route path="/ai/partner-pitch-draft"        element={<AIPartnerPitchPage />} />
            <Route path="/ai/exploration-budget"         element={<AIExplorationBudgetPage />} />
            <Route path="/ai/geologist-shift-plan"       element={<AIGeologistShiftPlanPage />} />
            <Route path="/ai/geochem-pathfinder-detect"  element={<AIGeochemPathfinderPage />} />
            <Route path="/ai/geophysics-interpretation"  element={<AIGeophysicsInterpretationPage />} />
            <Route path="/ai/resource-statement-draft"   element={<AIResourceStatementPage />} />
            <Route path="/ai/jurisdictional-risk"        element={<AIJurisdictionalRiskPage />} />

            <Route path="/webhooks" element={<WebhooksPage />} />

            <Route path="/custom-views" element={<CustomViewsPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <ShellRoutes />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
