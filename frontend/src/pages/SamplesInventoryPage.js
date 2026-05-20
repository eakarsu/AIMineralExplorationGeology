import React from 'react';
import CrudPage from '../components/CrudPage';
import { samplesInventoryApi } from '../services/api';

export default function SamplesInventoryPage() {
  return (
    <CrudPage
      title="Samples Inventory"
      subtitle="Chain-of-custody across camps and labs."
      api={samplesInventoryApi}
      statusKey="qa_status"
      fields={[
        { key: 'inv_id',    label: 'Inventory ID' },
        { key: 'sample_id', label: 'Sample / Assay ID' },
        { key: 'location',  label: 'Location' },
        { key: 'qa_status', label: 'QA Status', type: 'select', options: ['pending','received','shipped','in_transit','returned','rejected'] },
        { key: 'sent_to',   label: 'Sent To' },
        { key: 'ts',        label: 'Timestamp', type: 'datetime-local' },
        { key: 'notes',     label: 'Notes',     type: 'textarea' },
      ]}
    />
  );
}
