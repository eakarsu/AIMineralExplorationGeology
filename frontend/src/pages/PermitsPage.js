import React from 'react';
import CrudPage from '../components/CrudPage';
import { permitsApi } from '../services/api';

export default function PermitsPage() {
  return (
    <CrudPage
      title="Permits"
      subtitle="Authority, type and status by jurisdiction."
      api={permitsApi}
      statusKey="status"
      fields={[
        { key: 'permit_id',   label: 'Permit ID' },
        { key: 'property_id', label: 'Property ID' },
        { key: 'authority',   label: 'Authority' },
        { key: 'type',        label: 'Type' },
        { key: 'status',      label: 'Status', type: 'select', options: ['pending','issued','denied','withdrawn','expired'] },
        { key: 'issued_at',   label: 'Issued At', type: 'date' },
        { key: 'notes',       label: 'Notes',     type: 'textarea' },
      ]}
    />
  );
}
