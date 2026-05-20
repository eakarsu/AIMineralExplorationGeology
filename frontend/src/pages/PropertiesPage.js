import React from 'react';
import CrudPage from '../components/CrudPage';
import { propertiesApi } from '../services/api';

export default function PropertiesPage() {
  return (
    <CrudPage
      title="Properties"
      subtitle="Exploration properties under management."
      api={propertiesApi}
      statusKey="status"
      fields={[
        { key: 'property_id',      label: 'Property ID' },
        { key: 'name',             label: 'Name' },
        { key: 'country',          label: 'Country' },
        { key: 'area_km2',         label: 'Area (km²)',         type: 'number' },
        { key: 'commodity_target', label: 'Commodity Target' },
        { key: 'status',           label: 'Status',             type: 'select', options: ['active','permitting','on_hold','divested'] },
        { key: 'notes',            label: 'Notes',              type: 'textarea' },
      ]}
    />
  );
}
