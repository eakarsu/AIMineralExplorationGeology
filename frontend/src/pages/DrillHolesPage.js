import React from 'react';
import CrudPage from '../components/CrudPage';
import { drillHolesApi } from '../services/api';

export default function DrillHolesPage() {
  return (
    <CrudPage
      title="Drill Holes"
      subtitle="Diamond and RC drill holes by property."
      api={drillHolesApi}
      statusKey="status"
      fields={[
        { key: 'hole_id',     label: 'Hole ID' },
        { key: 'property_id', label: 'Property ID' },
        { key: 'collar_e',    label: 'Collar E', type: 'number' },
        { key: 'collar_n',    label: 'Collar N', type: 'number' },
        { key: 'depth_m',     label: 'Depth (m)', type: 'number' },
        { key: 'status',      label: 'Status',   type: 'select', options: ['planned','in_progress','completed','abandoned'] },
        { key: 'notes',       label: 'Notes',    type: 'textarea' },
      ]}
    />
  );
}
