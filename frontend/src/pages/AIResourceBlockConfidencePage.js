import React from 'react';
import AIPage from '../components/AIPage';
import { aiResourceBlockConfidence } from '../services/api';

export default function AIResourceBlockConfidencePage() {
  return (
    <AIPage
      title="AI · Resource Block Confidence"
      feature="resource-block-confidence"
      subtitle="Per-block NI 43-101 / JORC category (Inferred / Indicated / Measured) with drivers."
      inputs={[
        { key: 'property_id', label: 'Property ID', placeholder: 'e.g. PROP-CA-001' },
      ]}
      run={(v) => aiResourceBlockConfidence({ property_id: v.property_id })}
    />
  );
}
