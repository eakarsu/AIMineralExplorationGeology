import React from 'react';
import CrudPage from '../components/CrudPage';
import { expenseReportsApi } from '../services/api';

export default function ExpenseReportsPage() {
  return (
    <CrudPage
      title="Expense Reports"
      subtitle="Quarterly exploration spend by category."
      api={expenseReportsApi}
      statusKey="status"
      fields={[
        { key: 'expense_id',  label: 'Expense ID' },
        { key: 'property_id', label: 'Property ID' },
        { key: 'category',    label: 'Category', type: 'select', options: ['drilling','assay','geophysics','permits','community','environmental','camp_logistics','consulting','admin'] },
        { key: 'amount_usd',  label: 'Amount (USD)', type: 'number' },
        { key: 'period',      label: 'Period' },
        { key: 'status',      label: 'Status', type: 'select', options: ['recorded','pending','approved','rejected'] },
        { key: 'notes',       label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
