import React from 'react';
import CrudPage from '../components/CrudPage';
import { indigenousConsultationsApi } from '../services/api';

export default function IndigenousConsultationsPage() {
  return (
    <CrudPage
      title="Indigenous Consultations"
      subtitle="Community engagement and FPIC progress."
      api={indigenousConsultationsApi}
      statusKey="status"
      fields={[
        { key: 'consult_id',  label: 'Consult ID' },
        { key: 'property_id', label: 'Property ID' },
        { key: 'community',   label: 'Community' },
        { key: 'type',        label: 'Type' },
        { key: 'status',      label: 'Status', type: 'select', options: ['open','in_progress','completed','stalled'] },
        { key: 'ts',          label: 'Timestamp', type: 'datetime-local' },
        { key: 'notes',       label: 'Notes',     type: 'textarea' },
      ]}
    />
  );
}
