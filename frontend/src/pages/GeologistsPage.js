import React from 'react';
import CrudPage from '../components/CrudPage';
import { geologistsApi } from '../services/api';

export default function GeologistsPage() {
  return (
    <CrudPage
      title="Geologists"
      subtitle="In-house and rotational specialists."
      api={geologistsApi}
      statusKey="status"
      fields={[
        { key: 'geo_id',    label: 'Geo ID' },
        { key: 'name',      label: 'Name' },
        { key: 'specialty', label: 'Specialty' },
        { key: 'base',      label: 'Base' },
        { key: 'status',    label: 'Status', type: 'select', options: ['active','on_rotation','leave','retired'] },
        { key: 'contact',   label: 'Contact' },
        { key: 'notes',     label: 'Notes',  type: 'textarea' },
      ]}
    />
  );
}
