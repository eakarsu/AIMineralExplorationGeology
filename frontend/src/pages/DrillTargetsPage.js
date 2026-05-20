import React from 'react';
import CrudPage from '../components/CrudPage';
import { drillTargetsApi } from '../services/api';

export default function DrillTargetsPage() {
  return (
    <CrudPage
      title="Drill Targets"
      subtitle="Proposed and approved drill targets."
      api={drillTargetsApi}
      statusKey="priority"
      fields={[
        { key: 'target_id',   label: 'Target ID' },
        { key: 'property_id', label: 'Property ID' },
        { key: 'name',        label: 'Name' },
        { key: 'target_type', label: 'Target Type' },
        { key: 'priority',    label: 'Priority', type: 'select', options: ['low','medium','high','critical'] },
        { key: 'status',      label: 'Status',   type: 'select', options: ['proposed','approved','on_hold','drilled','rejected'] },
        { key: 'notes',       label: 'Notes',    type: 'textarea' },
      ]}
    />
  );
}
