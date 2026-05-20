import React from 'react';
import AIPage from '../components/AIPage';
import { aiNdp43101Summary } from '../services/api';

export default function AINdp43101SummaryPage() {
  return (
    <AIPage
      title="AI · NI 43-101 Summary"
      feature="ndp-43-101-summary"
      subtitle="Draft a tabletop NI 43-101 technical report summary for a property."
      inputs={[
        { key: 'property_id', label: 'Property ID',
          placeholder: 'e.g. PROP-CA-001' },
      ]}
      run={(v) => aiNdp43101Summary({ property_id: v.property_id })}
    />
  );
}
