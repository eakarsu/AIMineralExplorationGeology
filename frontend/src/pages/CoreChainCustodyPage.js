import React, { useState } from 'react';
import { apiFetch } from '../services/api';

export default function CoreChainCustodyPage() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const run = async () => {
    setError('');
    try {
      const payload = {
        trays: [
          { trayId: 'T-100', holeId: 'DDH-24-01', fromM: 50, toM: 55, sealStatus: 'sealed', photoLogged: true, assayPriority: 'high' },
          { trayId: 'T-101', holeId: 'DDH-24-01', fromM: 55, toM: 60, sealStatus: 'open', photoLogged: false, assayPriority: 'high' },
        ],
        handoffs: [{ trayId: 'T-100', from: 'rig', to: 'core shack' }, { trayId: 'T-100', from: 'core shack', to: 'lab courier' }],
      };
      setResult(await apiFetch('/core-chain-custody/audit', { method: 'POST', body: JSON.stringify(payload) }));
    } catch (err) {
      setError(err.message || 'Audit failed');
    }
  };

  return (
    <div>
      <h2>Drill Core Chain Of Custody</h2>
      <p>Audit core tray custody risk before assay shipment and resource modeling.</p>
      <button className="btn" onClick={run}>Run custody audit</button>
      {error && <div className="ai-error">{error}</div>}
      {result && <pre className="ai-result">{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
