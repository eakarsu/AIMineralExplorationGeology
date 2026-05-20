import React from 'react';
import CrudPage from '../components/CrudPage';
import { assayResultsApi } from '../services/api';

export default function AssayResultsPage() {
  return (
    <CrudPage
      title="Assay Results"
      subtitle="Down-hole assay intervals with element + grade."
      api={assayResultsApi}
      fields={[
        { key: 'assay_id',  label: 'Assay ID' },
        { key: 'hole_id',   label: 'Hole ID' },
        { key: 'from_m',    label: 'From (m)', type: 'number' },
        { key: 'to_m',      label: 'To (m)',   type: 'number' },
        { key: 'element',   label: 'Element',  type: 'select', options: ['Au','Ag','Cu','Mo','Ni','Co','Li','Pt','Pd','Fe','REE','Zn','Pb'] },
        { key: 'value_ppm', label: 'Value (ppm/g/t)', type: 'number' },
        { key: 'notes',     label: 'Notes',    type: 'textarea' },
      ]}
    />
  );
}
