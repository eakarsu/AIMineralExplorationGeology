import React from 'react';
import CrudPage from '../components/CrudPage';
import { contractorsApi } from '../services/api';

export default function ContractorsPage() {
  return (
    <CrudPage
      title="Contractors"
      subtitle="Drillers, labs, surveyors and consultants."
      api={contractorsApi}
      statusKey="status"
      fields={[
        { key: 'contractor_id', label: 'Contractor ID' },
        { key: 'name',          label: 'Name' },
        { key: 'service',       label: 'Service' },
        { key: 'country',       label: 'Country' },
        { key: 'rate_usd_day',  label: 'Rate (USD/day)', type: 'number' },
        { key: 'status',        label: 'Status',         type: 'select', options: ['approved','under_review','blocked'] },
        { key: 'notes',         label: 'Notes',          type: 'textarea' },
      ]}
    />
  );
}
