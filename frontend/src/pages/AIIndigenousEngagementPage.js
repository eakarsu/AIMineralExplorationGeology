import React from 'react';
import AIPage from '../components/AIPage';
import { aiIndigenousPlan } from '../services/api';

export default function AIIndigenousEngagementPage() {
  return (
    <AIPage
      title="AI · Indigenous Engagement Plan"
      feature="indigenous-engagement-plan"
      subtitle="FPIC-aware, multi-phase community engagement plan."
      inputs={[
        { key: 'community',   label: 'Community',   placeholder: 'e.g. Tahltan Central Government' },
        { key: 'property_id', label: 'Property ID', placeholder: 'e.g. PROP-CA-001' },
      ]}
      run={(v) => aiIndigenousPlan({ community: v.community, property_id: v.property_id || undefined })}
    />
  );
}
