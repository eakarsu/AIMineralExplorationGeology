import React from 'react';
import CrudPage from '../components/CrudPage';
import { geochemSamplesApi } from '../services/api';

export default function GeochemSamplesPage() {
  return (
    <CrudPage
      title="Geochem Samples"
      subtitle="Soil, rock chip, stream sediment and brine samples."
      api={geochemSamplesApi}
      statusKey="status"
      fields={[
        { key: 'sample_id',   label: 'Sample ID' },
        { key: 'property_id', label: 'Property ID' },
        { key: 'type',        label: 'Type', type: 'select', options: ['soil','rock chip','stream sediment','lateritic soil','till sample','termite mound','brine'] },
        { key: 'location',    label: 'Location' },
        { key: 'taken_at',    label: 'Taken At', type: 'date' },
        { key: 'status',      label: 'Status',   type: 'select', options: ['pending','analyzed','rejected'] },
        { key: 'notes',       label: 'Notes',    type: 'textarea' },
      ]}
    />
  );
}
