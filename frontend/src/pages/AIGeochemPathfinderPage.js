import React from 'react';
import AIPage from '../components/AIPage';
import { aiGeochemPathfinder } from '../services/api';

export default function AIGeochemPathfinderPage() {
  return (
    <AIPage
      title="AI · Geochem Pathfinder Detect"
      feature="geochem-pathfinder-detect"
      subtitle="Identify pathfinder elements for a target commodity."
      inputs={[
        { key: 'target',         label: 'Target Commodity',
          type: 'select', options: ['Au','Ag','Cu','Mo','Ni','Co','Li','Pt','Pd','Fe','REE','Zn','Pb'] },
        { key: 'context_notes',  label: 'Context Notes', type: 'textarea',
          placeholder: 'e.g. Focus on epithermal gold pathfinders across Hawkeye and Ashanti.' },
      ]}
      run={(v) => aiGeochemPathfinder({ target: v.target, context_notes: v.context_notes })}
    />
  );
}
