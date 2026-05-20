import React from 'react';
import AIPage from '../components/AIPage';
import { aiAnomalyCluster } from '../services/api';

export default function AIAnomalyClusterPage() {
  return (
    <AIPage
      title="AI · Anomaly Cluster"
      feature="anomaly-cluster"
      subtitle="Cluster geochem / geophysics anomalies into ranked drill-worthy targets."
      inputs={[
        { key: 'context_notes', label: 'Context / Bias',
          type: 'textarea',
          placeholder: 'e.g. Bias toward epithermal Au pathfinders (As, Sb, Hg) in the Hawkeye district.' },
      ]}
      run={(v) => aiAnomalyCluster({ context: { notes: v.context_notes } })}
    />
  );
}
