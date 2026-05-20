import React from 'react';
import AIPage from '../components/AIPage';
import { aiExplorationBudget } from '../services/api';

export default function AIExplorationBudgetPage() {
  return (
    <AIPage
      title="AI · Exploration Budget"
      feature="exploration-budget"
      subtitle="Build a phased exploration budget with go/no-go criteria."
      inputs={[
        { key: 'property_id', label: 'Property ID (optional)', placeholder: 'e.g. PROP-CA-001' },
        { key: 'objective',   label: 'Objective', type: 'textarea',
          placeholder: 'e.g. Phase II 5,000 m drill program + maiden NI 43-101 inferred resource within 14 months.' },
      ]}
      run={(v) => aiExplorationBudget({ property_id: v.property_id || undefined, objective: v.objective })}
    />
  );
}
