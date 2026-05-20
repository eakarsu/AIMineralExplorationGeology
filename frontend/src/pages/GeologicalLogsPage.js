import React from 'react';
import CrudPage from '../components/CrudPage';
import { geologicalLogsApi } from '../services/api';

export default function GeologicalLogsPage() {
  return (
    <CrudPage
      title="Geological Logs"
      subtitle="Lithology and structural logs per hole."
      api={geologicalLogsApi}
      fields={[
        { key: 'log_id',    label: 'Log ID' },
        { key: 'hole_id',   label: 'Hole ID' },
        { key: 'from_m',    label: 'From (m)', type: 'number' },
        { key: 'to_m',      label: 'To (m)',   type: 'number' },
        { key: 'lithology', label: 'Lithology' },
        { key: 'structure', label: 'Structure' },
        { key: 'notes',     label: 'Notes',    type: 'textarea' },
      ]}
    />
  );
}
