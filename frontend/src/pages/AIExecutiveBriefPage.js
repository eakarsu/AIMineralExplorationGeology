import React from 'react';
import AIPage from '../components/AIPage';
import { aiExecutiveBrief } from '../services/api';

export default function AIExecutiveBriefPage() {
  return (
    <AIPage
      title="AI · Executive Brief"
      feature="executive-brief"
      subtitle="Board-level exploration operations snapshot with decisions required."
      inputs={[
        { key: 'notes', label: 'Bias / Focus Notes', type: 'textarea',
          placeholder: 'e.g. Bias toward battery metals (Li, Ni, Co) and permitting risk.' },
      ]}
      run={(v) => aiExecutiveBrief({ notes: v.notes })}
    />
  );
}
