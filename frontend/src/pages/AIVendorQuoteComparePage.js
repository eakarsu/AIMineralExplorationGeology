import React from 'react';
import AIPage from '../components/AIPage';
import { aiVendorQuoteCompare } from '../services/api';

export default function AIVendorQuoteComparePage() {
  return (
    <AIPage
      title="AI · Vendor Quote Compare"
      feature="vendor-quote-compare"
      subtitle="Compare drilling / lab / consulting bids."
      inputs={[
        { key: 'service',     label: 'Scope of Work',  type: 'textarea',
          placeholder: 'e.g. Diamond core drilling — Hawkeye Phase II, 5,000 m' },
        { key: 'quotes_text', label: 'Quotes (free-form)', type: 'textarea',
          placeholder: 'Vendor A: $12,500/day, mob $85,000. Vendor B: $11,800/day, mob $92,000...' },
      ]}
      run={(v) => aiVendorQuoteCompare({ service: v.service, quotes_text: v.quotes_text })}
    />
  );
}
