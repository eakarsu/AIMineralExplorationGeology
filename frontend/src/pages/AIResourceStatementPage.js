import React from 'react';
import AIPage from '../components/AIPage';
import { aiResourceStatement } from '../services/api';

export default function AIResourceStatementPage() {
  return (
    <AIPage
      title="AI · Resource Statement Draft"
      feature="resource-statement-draft"
      subtitle="Draft a tabletop NI 43-101-style Mineral Resource Statement."
      inputs={[
        { key: 'property_id', label: 'Property ID', placeholder: 'e.g. PROP-CA-001' },
      ]}
      run={(v) => aiResourceStatement({ property_id: v.property_id })}
    />
  );
}
