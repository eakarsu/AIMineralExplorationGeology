import React from 'react';
import 'leaflet/dist/leaflet.css';

import DrillStripPlot from '../components/DrillStripPlot';
import AnomalyMap from '../components/AnomalyMap';
import ResourcePyramid from '../components/ResourcePyramid';
import PermitGantt from '../components/PermitGantt';

export default function CustomViewsPage() {
  return (
    <div className="custom-views-page">
      <div className="page-header">
        <h2>Exploration Views</h2>
        <p>
          Four specialised custom visualisations stitched on top of the
          drilling / geochem / NI 43-101 / permits tables.
        </p>
      </div>

      <div style={{ display: 'grid', gap: 24, marginTop: 24 }}>
        <DrillStripPlot />
        <AnomalyMap />
        <ResourcePyramid />
        <PermitGantt />
      </div>
    </div>
  );
}
