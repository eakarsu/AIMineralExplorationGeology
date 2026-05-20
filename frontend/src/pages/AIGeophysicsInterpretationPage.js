import React from 'react';
import AIPage from '../components/AIPage';
import { aiGeophysicsInterp } from '../services/api';

export default function AIGeophysicsInterpretationPage() {
  return (
    <AIPage
      title="AI · Geophysics Interpretation"
      feature="geophysics-interpretation"
      subtitle="Interpret a geophysical survey and propose follow-up drill targets."
      inputs={[
        { key: 'survey_id', label: 'Survey ID', placeholder: 'e.g. GP-2026-0001' },
      ]}
      run={(v) => aiGeophysicsInterp({ survey_id: v.survey_id })}
    />
  );
}
