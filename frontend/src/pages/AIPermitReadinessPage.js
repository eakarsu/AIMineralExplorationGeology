import React from 'react';
import AIPage from '../components/AIPage';
import { aiPermitReadiness } from '../services/api';

export default function AIPermitReadinessPage() {
  return (
    <AIPage
      title="AI · Permit Readiness"
      feature="permit-readiness"
      subtitle="Score permit readiness for a property against its jurisdictional checklist."
      inputs={[
        { key: 'property_id', label: 'Property ID', placeholder: 'e.g. PROP-CA-001' },
      ]}
      run={(v) => aiPermitReadiness({ property_id: v.property_id })}
    />
  );
}
