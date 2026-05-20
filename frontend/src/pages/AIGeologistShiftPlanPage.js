import React from 'react';
import AIPage from '../components/AIPage';
import { aiGeologistShiftPlan } from '../services/api';

export default function AIGeologistShiftPlanPage() {
  return (
    <AIPage
      title="AI · Geologist Shift Plan"
      feature="geologist-shift-plan"
      subtitle="FIFO rotation coverage planner across active properties."
      inputs={[
        { key: 'rotation_pattern', label: 'Rotation Pattern',
          placeholder: 'e.g. 4 weeks on / 2 weeks off', defaultValue: '4 weeks on / 2 weeks off' },
        { key: 'notes',            label: 'Notes / Bias', type: 'textarea',
          placeholder: 'Bias toward gold properties, Q3 drill push.' },
      ]}
      run={(v) => aiGeologistShiftPlan({ rotation_pattern: v.rotation_pattern, notes: v.notes })}
    />
  );
}
