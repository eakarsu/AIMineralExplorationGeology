import React from 'react';
import CrudPage from '../components/CrudPage';
import { claimsApi } from '../services/api';

export default function ClaimsPage() {
  return (
    <CrudPage
      title="Claims"
      subtitle="Mineral claims by property and expiry."
      api={claimsApi}
      statusKey="status"
      fields={[
        { key: 'claim_id',     label: 'Claim ID' },
        { key: 'property_id',  label: 'Property ID' },
        { key: 'claim_number', label: 'Claim Number' },
        { key: 'area_ha',      label: 'Area (ha)',  type: 'number' },
        { key: 'expires_at',   label: 'Expires',    type: 'date' },
        { key: 'status',       label: 'Status',     type: 'select', options: ['in_good_standing','pending_renewal','lapsed','disputed'] },
        { key: 'notes',        label: 'Notes',      type: 'textarea' },
      ]}
    />
  );
}
