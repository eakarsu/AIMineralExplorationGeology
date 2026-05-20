import React from 'react';
import CrudPage from '../components/CrudPage';
import { geophysicsSurveysApi } from '../services/api';

export default function GeophysicsSurveysPage() {
  return (
    <CrudPage
      title="Geophysics Surveys"
      subtitle="IP, EM, magnetics, gravity, CSAMT surveys."
      api={geophysicsSurveysApi}
      statusKey="status"
      fields={[
        { key: 'survey_id',    label: 'Survey ID' },
        { key: 'property_id',  label: 'Property ID' },
        { key: 'method',       label: 'Method' },
        { key: 'vendor',       label: 'Vendor' },
        { key: 'completed_at', label: 'Completed', type: 'date' },
        { key: 'status',       label: 'Status',    type: 'select', options: ['planned','in_progress','completed','cancelled'] },
        { key: 'notes',        label: 'Notes',     type: 'textarea' },
      ]}
    />
  );
}
