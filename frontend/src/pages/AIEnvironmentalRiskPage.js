import React from 'react';
import AIPage from '../components/AIPage';
import { aiEnvironmentalRisk } from '../services/api';

export default function AIEnvironmentalRiskPage() {
  return (
    <AIPage
      title="AI · Environmental Risk Brief"
      feature="environmental-risk-brief"
      subtitle="Risk drivers, mitigations and escalation triggers for a property."
      inputs={[
        { key: 'property_id', label: 'Property ID', placeholder: 'e.g. PROP-CD-006' },
      ]}
      run={(v) => aiEnvironmentalRisk({ property_id: v.property_id })}
    />
  );
}
