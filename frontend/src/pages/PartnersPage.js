import React from 'react';
import CrudPage from '../components/CrudPage';
import { partnersApi } from '../services/api';

export default function PartnersPage() {
  return (
    <CrudPage
      title="Partners / JVs"
      subtitle="Majors, off-takers, finance and accelerator partners."
      api={partnersApi}
      statusKey="status"
      fields={[
        { key: 'partner_id',    label: 'Partner ID' },
        { key: 'name',          label: 'Name' },
        { key: 'type',          label: 'Type', type: 'select', options: ['major_miner','junior','off-take','accelerator','finance','government'] },
        { key: 'ownership_pct', label: 'Ownership %', type: 'number' },
        { key: 'contact',       label: 'Contact' },
        { key: 'status',        label: 'Status', type: 'select', options: ['active','pending','terminated'] },
        { key: 'notes',         label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
