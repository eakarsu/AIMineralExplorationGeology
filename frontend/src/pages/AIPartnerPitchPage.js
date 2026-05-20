import React from 'react';
import AIPage from '../components/AIPage';
import { aiPartnerPitchDraft } from '../services/api';

export default function AIPartnerPitchPage() {
  return (
    <AIPage
      title="AI · Partner Pitch Draft"
      feature="partner-pitch-draft"
      subtitle="Draft a JV / off-take / financing pitch for a property."
      inputs={[
        { key: 'property_id', label: 'Property ID', placeholder: 'e.g. PROP-CA-001' },
        { key: 'audience',    label: 'Audience',    placeholder: 'e.g. Tier-1 gold major exploration team' },
      ]}
      run={(v) => aiPartnerPitchDraft({ property_id: v.property_id, audience: v.audience })}
    />
  );
}
