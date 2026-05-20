import React from 'react';
import AIPage from '../components/AIPage';
import { aiAssayTrend } from '../services/api';

export default function AIAssayTrendPage() {
  return (
    <AIPage
      title="AI · Assay Trend"
      feature="assay-trend"
      subtitle="Analyse downhole or element-wide assay trends."
      inputs={[
        { key: 'hole_id', label: 'Hole ID (optional)', placeholder: 'e.g. DDH-HAW-001' },
        { key: 'element', label: 'Element (optional)',
          type: 'select',
          options: ['Au','Ag','Cu','Mo','Ni','Co','Li','Pt','Pd','Fe','REE','Zn','Pb'] },
      ]}
      run={(v) => aiAssayTrend({ hole_id: v.hole_id || undefined, element: v.element || undefined })}
    />
  );
}
