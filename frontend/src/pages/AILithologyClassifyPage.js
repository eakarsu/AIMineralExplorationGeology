import React from 'react';
import AIPage from '../components/AIPage';
import { aiLithologyClassify } from '../services/api';

export default function AILithologyClassifyPage() {
  return (
    <AIPage
      title="AI · Lithology Classifier"
      feature="lithology-classify"
      subtitle="Classify drill-log intervals into lithology + alteration tags with confidence."
      inputs={[
        { key: 'hole_id',     label: 'Hole ID (optional)',     placeholder: 'e.g. DDH-HAW-001' },
        { key: 'property_id', label: 'Property ID (optional)', placeholder: 'e.g. PROP-CA-001' },
      ]}
      run={(v) => aiLithologyClassify({ hole_id: v.hole_id || undefined, property_id: v.property_id || undefined })}
    />
  );
}
