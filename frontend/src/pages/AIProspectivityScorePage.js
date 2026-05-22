import React from 'react';
import AIPage from '../components/AIPage';
import { aiProspectivityScore } from '../services/api';

export default function AIProspectivityScorePage() {
  return (
    <AIPage
      title="AI · Prospectivity Scorer"
      feature="prospectivity-score"
      subtitle="Multi-signal property prospectivity score (assays + geophys + geochem + structure)."
      inputs={[
        { key: 'property_id', label: 'Property ID', placeholder: 'e.g. PROP-CA-001' },
      ]}
      run={(v) => aiProspectivityScore({ property_id: v.property_id })}
    />
  );
}
