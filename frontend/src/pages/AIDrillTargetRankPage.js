import React from 'react';
import AIPage from '../components/AIPage';
import { aiDrillTargetRank } from '../services/api';

export default function AIDrillTargetRankPage() {
  return (
    <AIPage
      title="AI · Drill Target Rank"
      feature="drill-target-rank"
      subtitle="Rank current drill targets against an approved campaign budget."
      inputs={[
        { key: 'budget_usd', label: 'Campaign Budget (USD)', type: 'number',
          placeholder: 'e.g. 4500000', defaultValue: 4500000 },
      ]}
      run={(v) => aiDrillTargetRank({ budget_usd: Number(v.budget_usd || 0) })}
    />
  );
}
