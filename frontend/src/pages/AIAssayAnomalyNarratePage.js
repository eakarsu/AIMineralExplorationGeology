import React from 'react';
import AIPage from '../components/AIPage';
import { aiAssayAnomalyNarrate } from '../services/api';

export default function AIAssayAnomalyNarratePage() {
  return (
    <AIPage
      title="AI · Assay Anomaly Narrator"
      feature="assay-anomaly-narrate"
      subtitle="Narrative report for an assay batch — anomaly class, elemental associations, drill follow-ups."
      inputs={[
        { key: 'hole_id',     label: 'Hole ID (optional)',     placeholder: 'e.g. DDH-HAW-001' },
        { key: 'property_id', label: 'Property ID (optional)', placeholder: 'e.g. PROP-CA-001' },
        { key: 'element',     label: 'Element (optional)',     placeholder: 'e.g. Au' },
      ]}
      run={(v) => aiAssayAnomalyNarrate({
        hole_id: v.hole_id || undefined,
        property_id: v.property_id || undefined,
        element: v.element || undefined,
      })}
    />
  );
}
