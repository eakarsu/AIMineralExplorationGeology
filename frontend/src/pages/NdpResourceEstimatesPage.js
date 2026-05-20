import React from 'react';
import CrudPage from '../components/CrudPage';
import { ndpResourceEstimatesApi } from '../services/api';

export default function NdpResourceEstimatesPage() {
  return (
    <CrudPage
      title="NI 43-101 Resource Estimates"
      subtitle="Tabletop resource categories, tonnage and grade."
      api={ndpResourceEstimatesApi}
      fields={[
        { key: 'estimate_id',   label: 'Estimate ID' },
        { key: 'property_id',   label: 'Property ID' },
        { key: 'category',      label: 'Category', type: 'select', options: ['Inferred','Indicated','Measured'] },
        { key: 'tonnes',        label: 'Tonnes',   type: 'number' },
        { key: 'grade',         label: 'Grade (ppm / g/t / %)', type: 'number' },
        { key: 'ndp_compliant', label: 'NI 43-101 Compliant', type: 'select', options: ['true','false'] },
        { key: 'notes',         label: 'Notes',    type: 'textarea' },
      ]}
    />
  );
}
