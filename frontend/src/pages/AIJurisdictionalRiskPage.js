import React from 'react';
import AIPage from '../components/AIPage';
import { aiJurisdictionalRisk } from '../services/api';

export default function AIJurisdictionalRiskPage() {
  return (
    <AIPage
      title="AI · Jurisdictional Risk"
      feature="jurisdictional-risk"
      subtitle="Score and narrate country-level mining risk."
      inputs={[
        { key: 'country',     label: 'Country',     placeholder: 'e.g. Canada' },
        { key: 'property_id', label: 'Property ID (optional)', placeholder: 'e.g. PROP-CA-001' },
      ]}
      run={(v) => aiJurisdictionalRisk({ country: v.country, property_id: v.property_id || undefined })}
    />
  );
}
