import React from 'react';
import CrudPage from '../components/CrudPage';
import { environmentalImpactsApi } from '../services/api';

export default function EnvironmentalImpactsPage() {
  return (
    <CrudPage
      title="Environmental Impacts"
      subtitle="Open environmental flags and severity."
      api={environmentalImpactsApi}
      statusKey="severity"
      fields={[
        { key: 'impact_id',   label: 'Impact ID' },
        { key: 'property_id', label: 'Property ID' },
        { key: 'type',        label: 'Type' },
        { key: 'severity',    label: 'Severity', type: 'select', options: ['low','medium','high','critical'] },
        { key: 'opened_at',   label: 'Opened At', type: 'date' },
        { key: 'status',      label: 'Status',    type: 'select', options: ['open','mitigated','closed','escalated'] },
        { key: 'notes',       label: 'Notes',     type: 'textarea' },
      ]}
    />
  );
}
