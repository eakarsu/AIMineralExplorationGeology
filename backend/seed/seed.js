const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'mineral_exploration',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('[seed] resetting tables...');
    await client.query(`
      DROP TABLE IF EXISTS properties                CASCADE;
      DROP TABLE IF EXISTS claims                    CASCADE;
      DROP TABLE IF EXISTS drill_holes               CASCADE;
      DROP TABLE IF EXISTS assay_results             CASCADE;
      DROP TABLE IF EXISTS geophysics_surveys        CASCADE;
      DROP TABLE IF EXISTS geochem_samples           CASCADE;
      DROP TABLE IF EXISTS geological_logs           CASCADE;
      DROP TABLE IF EXISTS geologists                CASCADE;
      DROP TABLE IF EXISTS contractors               CASCADE;
      DROP TABLE IF EXISTS samples_inventory         CASCADE;
      DROP TABLE IF EXISTS permits                   CASCADE;
      DROP TABLE IF EXISTS environmental_impacts     CASCADE;
      DROP TABLE IF EXISTS indigenous_consultations  CASCADE;
      DROP TABLE IF EXISTS drill_targets             CASCADE;
      DROP TABLE IF EXISTS ndp_resource_estimates    CASCADE;
      DROP TABLE IF EXISTS expense_reports           CASCADE;
      DROP TABLE IF EXISTS partners                  CASCADE;
      DROP TABLE IF EXISTS audit_log                 CASCADE;
      DROP TABLE IF EXISTS ai_results                CASCADE;
      DROP TABLE IF EXISTS users                     CASCADE;
      DROP TABLE IF EXISTS notifications             CASCADE;
      DROP TABLE IF EXISTS attachments               CASCADE;
      DROP TABLE IF EXISTS webhooks                  CASCADE;
      DROP TABLE IF EXISTS webhook_deliveries        CASCADE;
    `);

    console.log('[seed] applying migrations...');
    const schema1 = fs.readFileSync(path.join(__dirname, '..', 'migrations', '001_schema.sql'), 'utf8');
    await client.query(schema1);

    console.log('[seed] inserting properties...');
    const properties = [
      ['PROP-CA-001', 'Hawkeye Gold Project',          'Canada',        45.20, 'Au',           'active'],
      ['PROP-CA-002', 'Red Caribou Copper',            'Canada',        88.50, 'Cu-Au',        'active'],
      ['PROP-PE-003', 'Cerro Verde Silver',            'Peru',          22.40, 'Ag-Pb-Zn',     'active'],
      ['PROP-AU-004', 'Marble Bar Lithium',            'Australia',    120.00, 'Li',           'active'],
      ['PROP-CL-005', 'Atacama Copper-Moly',           'Chile',         62.80, 'Cu-Mo',        'active'],
      ['PROP-CD-006', 'Katanga Cobalt JV',             'DRC',           38.10, 'Co-Cu',        'permitting'],
      ['PROP-BR-007', 'Carajas Iron Ore Extension',    'Brazil',       210.00, 'Fe',           'active'],
      ['PROP-MX-008', 'Sonora Silver-Gold',            'Mexico',        18.60, 'Ag-Au',        'active'],
      ['PROP-NV-009', 'Battle Mountain North',         'USA',           34.50, 'Au',           'active'],
      ['PROP-ZA-010', 'Bushveld PGE',                  'South Africa',  76.30, 'Pt-Pd-Rh',     'active'],
      ['PROP-FI-011', 'Lapland Nickel Sulphide',       'Finland',       95.80, 'Ni-Cu-PGE',    'active'],
      ['PROP-AR-012', 'Salta Lithium Brine',           'Argentina',    180.40, 'Li',           'permitting'],
      ['PROP-MN-013', 'Gobi Rare Earth Project',       'Mongolia',     142.00, 'REE',          'active'],
      ['PROP-PG-014', 'Highlands Copper-Gold',         'Papua NG',      28.70, 'Cu-Au',        'on_hold'],
      ['PROP-GH-015', 'Ashanti West Gold',             'Ghana',         52.10, 'Au',           'active'],
    ];
    for (const p of properties) {
      await client.query(
        `INSERT INTO properties (property_id,name,country,area_km2,commodity_target,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        p
      );
    }

    console.log('[seed] inserting claims...');
    const claims = [
      ['CLM-0001', 'PROP-CA-001', 'TC-44721', 256.00, '2027-08-14', 'in_good_standing'],
      ['CLM-0002', 'PROP-CA-001', 'TC-44722', 256.00, '2027-08-14', 'in_good_standing'],
      ['CLM-0003', 'PROP-CA-002', 'BC-91204', 412.00, '2026-11-30', 'in_good_standing'],
      ['CLM-0004', 'PROP-PE-003', 'PE-3387A',  98.50, '2026-09-21', 'in_good_standing'],
      ['CLM-0005', 'PROP-AU-004', 'E45/5821', 510.00, '2028-03-12', 'in_good_standing'],
      ['CLM-0006', 'PROP-CL-005', 'CL-04488', 308.00, '2027-05-04', 'in_good_standing'],
      ['CLM-0007', 'PROP-CD-006', 'PR-15229', 184.00, '2026-07-19', 'pending_renewal'],
      ['CLM-0008', 'PROP-BR-007', 'BR-21908', 980.00, '2029-01-08', 'in_good_standing'],
      ['CLM-0009', 'PROP-MX-008', 'MX-77621', 122.00, '2026-12-02', 'in_good_standing'],
      ['CLM-0010', 'PROP-NV-009', 'NMC-90021',160.00, '2027-02-28', 'in_good_standing'],
      ['CLM-0011', 'PROP-ZA-010', 'ZA-44211', 344.00, '2028-08-16', 'in_good_standing'],
      ['CLM-0012', 'PROP-FI-011', 'FI-77042', 482.00, '2027-04-09', 'in_good_standing'],
      ['CLM-0013', 'PROP-AR-012', 'AR-22019', 905.00, '2028-10-22', 'pending_renewal'],
      ['CLM-0014', 'PROP-MN-013', 'MN-18860', 712.00, '2027-09-15', 'in_good_standing'],
      ['CLM-0015', 'PROP-GH-015', 'GH-30217', 261.00, '2026-10-12', 'in_good_standing'],
    ];
    for (const c of claims) {
      await client.query(
        `INSERT INTO claims (claim_id,property_id,claim_number,area_ha,expires_at,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        c
      );
    }

    console.log('[seed] inserting drill_holes...');
    const holes = [
      ['DDH-HAW-001', 'PROP-CA-001', 481250.50, 5562880.10, 412.30, 'completed'],
      ['DDH-HAW-002', 'PROP-CA-001', 481310.00, 5562910.40, 388.60, 'completed'],
      ['DDH-RCC-001', 'PROP-CA-002', 612400.20, 6041220.55, 506.90, 'in_progress'],
      ['DDH-CRV-001', 'PROP-PE-003', 220150.00, 8158400.00, 320.10, 'completed'],
      ['DDH-MBL-001', 'PROP-AU-004', 720801.30, 7641002.70, 248.00, 'completed'],
      ['DDH-ATC-001', 'PROP-CL-005', 482220.00, 7100250.00, 618.40, 'in_progress'],
      ['DDH-KAT-001', 'PROP-CD-006', 482010.00, 8810200.00, 280.50, 'planned'],
      ['DDH-CAR-001', 'PROP-BR-007', 632180.00, 9320480.00, 152.00, 'completed'],
      ['DDH-SON-001', 'PROP-MX-008', 412900.00, 3320150.00, 410.20, 'completed'],
      ['DDH-BMN-001', 'PROP-NV-009', 481100.00, 4498770.00, 364.80, 'in_progress'],
      ['DDH-BSV-001', 'PROP-ZA-010', 290450.00, 7148000.00, 720.10, 'completed'],
      ['DDH-LAP-001', 'PROP-FI-011', 510210.00, 7411200.00, 488.30, 'in_progress'],
      ['DDH-SAL-001', 'PROP-AR-012', 372910.00, 7400500.00,  78.00, 'planned'],
      ['DDH-GOB-001', 'PROP-MN-013', 612300.00, 4882100.00, 220.00, 'completed'],
      ['DDH-ASH-001', 'PROP-GH-015', 612700.00,  712880.00, 388.40, 'in_progress'],
    ];
    for (const h of holes) {
      await client.query(
        `INSERT INTO drill_holes (hole_id,property_id,collar_e,collar_n,depth_m,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        h
      );
    }

    console.log('[seed] inserting assay_results...');
    const assays = [
      ['AS-00001', 'DDH-HAW-001', 120.00, 121.50, 'Au',  4.820],
      ['AS-00002', 'DDH-HAW-001', 121.50, 123.00, 'Au',  7.140],
      ['AS-00003', 'DDH-HAW-002',  88.00,  90.00, 'Au',  1.240],
      ['AS-00004', 'DDH-RCC-001', 210.00, 212.00, 'Cu',  8120.00],
      ['AS-00005', 'DDH-CRV-001',  44.50,  46.00, 'Ag',  142.80],
      ['AS-00006', 'DDH-MBL-001',  82.00,  84.00, 'Li',  9800.00],
      ['AS-00007', 'DDH-ATC-001', 305.00, 307.00, 'Cu',  6450.00],
      ['AS-00008', 'DDH-ATC-001', 311.00, 313.00, 'Mo',  240.00],
      ['AS-00009', 'DDH-CAR-001',  20.00,  22.00, 'Fe',  624000.00],
      ['AS-00010', 'DDH-SON-001', 188.00, 190.00, 'Ag',  88.20],
      ['AS-00011', 'DDH-BMN-001', 102.00, 104.00, 'Au',  2.350],
      ['AS-00012', 'DDH-BSV-001', 410.00, 412.00, 'Pt',  4.880],
      ['AS-00013', 'DDH-LAP-001', 281.00, 283.00, 'Ni',  9800.00],
      ['AS-00014', 'DDH-GOB-001',  64.00,  66.00, 'REE', 22000.00],
      ['AS-00015', 'DDH-ASH-001', 211.00, 213.00, 'Au',  3.150],
    ];
    for (const a of assays) {
      await client.query(
        `INSERT INTO assay_results (assay_id,hole_id,from_m,to_m,element,value_ppm) VALUES ($1,$2,$3,$4,$5,$6)`,
        a
      );
    }

    console.log('[seed] inserting geophysics_surveys...');
    const geophys = [
      ['GP-2026-0001', 'PROP-CA-001', 'IP/Resistivity',       'Quantec Geoscience',  '2026-03-12', 'completed'],
      ['GP-2026-0002', 'PROP-CA-001', 'Airborne magnetics',   'Geotech VTEM',        '2026-02-04', 'completed'],
      ['GP-2026-0003', 'PROP-CA-002', 'Airborne EM',          'Geotech VTEM Plus',   '2026-01-22', 'completed'],
      ['GP-2026-0004', 'PROP-PE-003', 'IP/Resistivity',       'Val d Or Geophysics', '2026-04-09', 'completed'],
      ['GP-2026-0005', 'PROP-AU-004', 'Gravity',              'Atlas Geophysics',    '2026-02-28', 'completed'],
      ['GP-2026-0006', 'PROP-CL-005', 'CSAMT',                'Zonge Engineering',   '2026-03-18', 'completed'],
      ['GP-2026-0007', 'PROP-CD-006', 'Airborne magnetics',   'Sander Geophysics',   '2026-04-22', 'in_progress'],
      ['GP-2026-0008', 'PROP-BR-007', 'Gravity gradiometry',  'Bell Geospace',       '2026-01-15', 'completed'],
      ['GP-2026-0009', 'PROP-MX-008', 'IP/Resistivity',       'SJ Geophysics',       '2026-03-30', 'completed'],
      ['GP-2026-0010', 'PROP-NV-009', 'CSAMT',                'Zonge Engineering',   '2026-04-14', 'completed'],
      ['GP-2026-0011', 'PROP-ZA-010', 'Borehole TEM',         'Crone Geophysics',    '2026-02-19', 'completed'],
      ['GP-2026-0012', 'PROP-FI-011', 'Borehole EM',          'EMIT MaxwellPro',     '2026-03-26', 'in_progress'],
      ['GP-2026-0013', 'PROP-AR-012', 'TEM (brine)',          'Quantec Geoscience',  '2026-04-05', 'planned'],
      ['GP-2026-0014', 'PROP-MN-013', 'Radiometrics',         'Sander Geophysics',   '2026-02-12', 'completed'],
      ['GP-2026-0015', 'PROP-GH-015', 'Ground magnetics',     'Local crew',          '2026-04-29', 'completed'],
    ];
    for (const g of geophys) {
      await client.query(
        `INSERT INTO geophysics_surveys (survey_id,property_id,method,vendor,completed_at,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        g
      );
    }

    console.log('[seed] inserting geochem_samples...');
    const geochem = [
      ['GC-0001', 'PROP-CA-001', 'soil',           'Grid line 100N, station 200E', '2026-04-02', 'analyzed'],
      ['GC-0002', 'PROP-CA-001', 'rock chip',      'Outcrop A — quartz vein',      '2026-04-03', 'analyzed'],
      ['GC-0003', 'PROP-CA-002', 'stream sediment','Caribou Creek confluence',     '2026-03-18', 'analyzed'],
      ['GC-0004', 'PROP-PE-003', 'soil',           'Ridge 4200m, line 050S',       '2026-04-08', 'pending'],
      ['GC-0005', 'PROP-AU-004', 'rock chip',      'Pegmatite outcrop MBL-1',      '2026-03-25', 'analyzed'],
      ['GC-0006', 'PROP-CL-005', 'soil',           'Alluvial fan north sector',    '2026-04-12', 'analyzed'],
      ['GC-0007', 'PROP-CD-006', 'termite mound',  'Kasompi Ridge T-04',           '2026-04-15', 'pending'],
      ['GC-0008', 'PROP-BR-007', 'lateritic soil', 'Plateau B sample grid',        '2026-02-14', 'analyzed'],
      ['GC-0009', 'PROP-MX-008', 'rock chip',      'Vein SON-3 channel sample',    '2026-03-29', 'analyzed'],
      ['GC-0010', 'PROP-NV-009', 'soil',           'Pediment grid 050E line 100N', '2026-04-18', 'analyzed'],
      ['GC-0011', 'PROP-ZA-010', 'rock chip',      'Merensky Reef outcrop M-2',    '2026-02-26', 'analyzed'],
      ['GC-0012', 'PROP-FI-011', 'till sample',    'Esker NE corner, station T-12','2026-04-01', 'analyzed'],
      ['GC-0013', 'PROP-AR-012', 'brine',          'Salar borehole SB-04 (10m)',   '2026-04-10', 'pending'],
      ['GC-0014', 'PROP-MN-013', 'rock chip',      'Carbonatite plug NW outcrop',  '2026-02-22', 'analyzed'],
      ['GC-0015', 'PROP-GH-015', 'lateritic soil', 'Hill ASH-2, grid 050W',        '2026-04-25', 'pending'],
    ];
    for (const g of geochem) {
      await client.query(
        `INSERT INTO geochem_samples (sample_id,property_id,type,location,taken_at,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        g
      );
    }

    console.log('[seed] inserting geological_logs...');
    const logs = [
      ['LOG-0001', 'DDH-HAW-001',   0.0,  44.0, 'Overburden / saprolite',     'no structure'],
      ['LOG-0002', 'DDH-HAW-001',  44.0, 118.0, 'Sericite-altered andesite',  'shear @ 102m, 060/74'],
      ['LOG-0003', 'DDH-HAW-001', 118.0, 142.0, 'Quartz-pyrite vein zone',    'high-strain zone'],
      ['LOG-0004', 'DDH-HAW-002',  60.0, 142.0, 'Propylitic andesite',        'minor fault @ 102m'],
      ['LOG-0005', 'DDH-RCC-001', 180.0, 240.0, 'Potassic granodiorite',      'stockwork quartz'],
      ['LOG-0006', 'DDH-CRV-001',  20.0,  90.0, 'Massive limestone',          'karstic'],
      ['LOG-0007', 'DDH-MBL-001',  60.0, 100.0, 'LCT pegmatite',              'undeformed'],
      ['LOG-0008', 'DDH-ATC-001', 280.0, 360.0, 'Phyllic-altered porphyry',   'B-vein quartz'],
      ['LOG-0009', 'DDH-CAR-001',  10.0,  80.0, 'BIF (banded iron formation)','fold hinge'],
      ['LOG-0010', 'DDH-SON-001', 160.0, 240.0, 'Epithermal vein in andesite','vein swarm 070°'],
      ['LOG-0011', 'DDH-BMN-001',  80.0, 180.0, 'Calcareous mudstone',        'sediment-hosted'],
      ['LOG-0012', 'DDH-BSV-001', 380.0, 460.0, 'Pyroxenite layer',           'igneous layering'],
      ['LOG-0013', 'DDH-LAP-001', 240.0, 320.0, 'Komatiite',                  'spinifex texture'],
      ['LOG-0014', 'DDH-GOB-001',  40.0, 120.0, 'Carbonatite',                'fluorite veins'],
      ['LOG-0015', 'DDH-ASH-001', 180.0, 260.0, 'Banded biotite schist',      'shear-hosted'],
    ];
    for (const l of logs) {
      await client.query(
        `INSERT INTO geological_logs (log_id,hole_id,from_m,to_m,lithology,structure) VALUES ($1,$2,$3,$4,$5,$6)`,
        l
      );
    }

    console.log('[seed] inserting geologists...');
    const geos = [
      ['GEO-001', 'Dr. Marisol Reyes',     'Epithermal Au-Ag',         'Lima, PE',          'active',     'm.reyes@minexplore.io'],
      ['GEO-002', 'Henrik Larsen',         'Porphyry Cu-Mo',           'Vancouver, CA',     'active',     'h.larsen@minexplore.io'],
      ['GEO-003', 'Dr. Femi Okoye',        'Greenstone Au',            'Accra, GH',         'active',     'f.okoye@minexplore.io'],
      ['GEO-004', 'Anna Volkov',           'LCT pegmatite Li',         'Perth, AU',         'active',     'a.volkov@minexplore.io'],
      ['GEO-005', 'Dr. Carlos Mendoza',    'IOCG / Andes Cu',          'Santiago, CL',      'active',     'c.mendoza@minexplore.io'],
      ['GEO-006', 'Ruth Sithole',          'Bushveld PGE',             'Johannesburg, ZA',  'active',     'r.sithole@minexplore.io'],
      ['GEO-007', 'Dr. Jean-Pierre Dubois','Ni-Cu-PGE mafic-ultramafic','Sudbury, CA',      'active',     'jp.dubois@minexplore.io'],
      ['GEO-008', 'Liu Wen',               'REE carbonatites',         'Ulaanbaatar, MN',   'active',     'l.wen@minexplore.io'],
      ['GEO-009', 'Dr. Sara Ahmadi',       'Sediment-hosted Au',       'Reno, US',          'active',     's.ahmadi@minexplore.io'],
      ['GEO-010', 'Tom Beckham',           'Structural / mapping',     'Brisbane, AU',      'on_rotation','t.beckham@minexplore.io'],
      ['GEO-011', 'Dr. Pranav Iyer',       'Geochem / pathfinder',     'Bangalore, IN',     'active',     'p.iyer@minexplore.io'],
      ['GEO-012', 'Erika Wahlstrom',       'Glaciated terrains',       'Rovaniemi, FI',     'active',     'e.wahlstrom@minexplore.io'],
      ['GEO-013', 'Dr. Mateo Fernandez',   'Lithium brines',           'Salta, AR',         'active',     'm.fernandez@minexplore.io'],
      ['GEO-014', 'Grace Otieno',          'Junior field geologist',   'Nairobi, KE',       'on_rotation','g.otieno@minexplore.io'],
      ['GEO-015', 'Dr. Klaus Mueller',     'Resource estimation',      'Freiburg, DE',      'active',     'k.muller@minexplore.io'],
    ];
    for (const g of geos) {
      await client.query(
        `INSERT INTO geologists (geo_id,name,specialty,base,status,contact) VALUES ($1,$2,$3,$4,$5,$6)`,
        g
      );
    }

    console.log('[seed] inserting contractors...');
    const contractors = [
      ['CTR-001', 'Major Drilling Group',     'Diamond core drilling',  'Canada',     12500, 'approved'],
      ['CTR-002', 'Boart Longyear',           'RC + diamond drilling',  'USA',        11800, 'approved'],
      ['CTR-003', 'Foraco International',     'Drilling',               'France',     10200, 'approved'],
      ['CTR-004', 'Geotech Ltd',              'Airborne EM/Mag',        'Canada',     22000, 'approved'],
      ['CTR-005', 'Sander Geophysics',        'Airborne mag/grav/rad',  'Canada',     21500, 'approved'],
      ['CTR-006', 'Zonge Engineering',        'Ground IP / CSAMT',      'USA',         9800, 'approved'],
      ['CTR-007', 'Crone Geophysics',         'Borehole EM',            'Canada',      8500, 'approved'],
      ['CTR-008', 'ALS Geochemistry',         'Assay lab',              'Australia',   3200, 'approved'],
      ['CTR-009', 'SGS Mineral Services',     'Assay lab + QA/QC',      'Switzerland', 3400, 'approved'],
      ['CTR-010', 'Bureau Veritas Minerals',  'Assay lab',              'France',      3300, 'approved'],
      ['CTR-011', 'AECOM',                    'Environmental baseline', 'USA',         4800, 'approved'],
      ['CTR-012', 'Knight Piesold',           'Permitting / EIA',       'Canada',      5600, 'approved'],
      ['CTR-013', 'Wood plc',                 'NI 43-101 QP',           'UK',          7200, 'approved'],
      ['CTR-014', 'Local Logistics SARL',     'Camp + light vehicles',  'DRC',         1800, 'under_review'],
      ['CTR-015', 'AeroSurvey Mongolia',      'Survey logistics',       'Mongolia',    2400, 'approved'],
    ];
    for (const c of contractors) {
      await client.query(
        `INSERT INTO contractors (contractor_id,name,service,country,rate_usd_day,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        c
      );
    }

    console.log('[seed] inserting samples_inventory...');
    const inv = [
      ['INV-0001', 'GC-0001', 'Core shack Hawkeye',      'received',   'ALS Vancouver',       '2026-04-05 14:00+00'],
      ['INV-0002', 'GC-0002', 'Core shack Hawkeye',      'shipped',    'ALS Vancouver',       '2026-04-06 09:30+00'],
      ['INV-0003', 'AS-00001','Core shack Hawkeye',      'returned',   'ALS Vancouver',       '2026-04-22 18:00+00'],
      ['INV-0004', 'GC-0003', 'Red Caribou camp',        'shipped',    'Bureau Veritas BC',   '2026-03-21 11:00+00'],
      ['INV-0005', 'GC-0004', 'Cerro Verde camp',        'received',   'SGS Lima',            '2026-04-10 16:00+00'],
      ['INV-0006', 'GC-0005', 'Marble Bar camp',         'returned',   'ALS Perth',           '2026-04-12 09:00+00'],
      ['INV-0007', 'GC-0006', 'Atacama base',            'shipped',    'ALS Santiago',        '2026-04-15 13:00+00'],
      ['INV-0008', 'GC-0007', 'Katanga camp',            'in_transit', 'SGS Mwanza',          '2026-04-17 19:00+00'],
      ['INV-0009', 'GC-0008', 'Carajas camp',            'returned',   'SGS Belo Horizonte',  '2026-03-08 10:00+00'],
      ['INV-0010', 'AS-00010','Sonora camp',             'returned',   'ALS Hermosillo',      '2026-04-15 12:00+00'],
      ['INV-0011', 'GC-0010', 'Battle Mountain camp',    'shipped',    'ALS Reno',            '2026-04-20 17:00+00'],
      ['INV-0012', 'AS-00012','Bushveld camp',           'returned',   'Set Point Labs',      '2026-03-19 09:00+00'],
      ['INV-0013', 'GC-0012', 'Lapland camp',            'received',   'Eurofins Labtium',    '2026-04-04 14:00+00'],
      ['INV-0014', 'GC-0013', 'Salta lab',               'pending',    'SGS Salta',           '2026-04-12 11:00+00'],
      ['INV-0015', 'GC-0014', 'Gobi camp',               'shipped',    'ALS Brisbane',        '2026-02-26 08:00+00'],
    ];
    for (const i of inv) {
      await client.query(
        `INSERT INTO samples_inventory (inv_id,sample_id,location,qa_status,sent_to,ts) VALUES ($1,$2,$3,$4,$5,$6)`,
        i
      );
    }

    console.log('[seed] inserting permits...');
    const permits = [
      ['PERM-0001', 'PROP-CA-001', 'BC Ministry of Energy & Mines',     'Notice of Work',           'issued',   '2026-02-10'],
      ['PERM-0002', 'PROP-CA-002', 'Yukon Geological Survey',           'Class 3 Land Use',         'issued',   '2026-01-22'],
      ['PERM-0003', 'PROP-PE-003', 'INGEMMET (Peru)',                   'DIA category 1',           'pending',  null],
      ['PERM-0004', 'PROP-AU-004', 'WA Dept of Mines',                  'Programme of Work',        'issued',   '2026-03-04'],
      ['PERM-0005', 'PROP-CL-005', 'Sernageomin (Chile)',               'Exploration permit',       'issued',   '2026-02-28'],
      ['PERM-0006', 'PROP-CD-006', 'Ministere des Mines (DRC)',         'PR renewal',               'pending',  null],
      ['PERM-0007', 'PROP-BR-007', 'ANM (Brazil)',                      'Pesquisa renewal',         'issued',   '2026-01-08'],
      ['PERM-0008', 'PROP-MX-008', 'DGM Mexico',                        'Concession good standing', 'issued',   '2026-03-20'],
      ['PERM-0009', 'PROP-NV-009', 'BLM Battle Mountain',               'NOI exploration',          'issued',   '2026-02-15'],
      ['PERM-0010', 'PROP-ZA-010', 'DMRE South Africa',                 'Prospecting right',        'issued',   '2026-03-09'],
      ['PERM-0011', 'PROP-FI-011', 'Tukes (Finland)',                   'Exploration permit',       'issued',   '2026-02-22'],
      ['PERM-0012', 'PROP-AR-012', 'Secretaria Mineria Salta',          'EIA cat. 2',               'pending',  null],
      ['PERM-0013', 'PROP-MN-013', 'MRPAM (Mongolia)',                  'Exploration licence',      'issued',   '2026-01-30'],
      ['PERM-0014', 'PROP-PG-014', 'MRA (PNG)',                         'EL renewal',               'denied',   null],
      ['PERM-0015', 'PROP-GH-015', 'Minerals Commission (Ghana)',       'PR continuation',          'issued',   '2026-03-25'],
    ];
    for (const p of permits) {
      await client.query(
        `INSERT INTO permits (permit_id,property_id,authority,type,status,issued_at) VALUES ($1,$2,$3,$4,$5,$6)`,
        p
      );
    }

    console.log('[seed] inserting environmental_impacts...');
    const env = [
      ['ENV-0001', 'PROP-CA-001', 'Sediment runoff into creek',  'low',      '2026-04-02', 'mitigated'],
      ['ENV-0002', 'PROP-CA-002', 'Caribou crossing disruption', 'medium',   '2026-03-28', 'open'],
      ['ENV-0003', 'PROP-PE-003', 'Water use vs altiplano',      'medium',   '2026-04-12', 'open'],
      ['ENV-0004', 'PROP-AU-004', 'Dust on station road',        'low',      '2026-03-15', 'mitigated'],
      ['ENV-0005', 'PROP-CL-005', 'Sulfate dust to wetland',     'high',     '2026-04-08', 'open'],
      ['ENV-0006', 'PROP-CD-006', 'Tailings precursor leak',     'critical', '2026-04-15', 'open'],
      ['ENV-0007', 'PROP-BR-007', 'Cleared lateritic vegetation','medium',   '2026-02-04', 'mitigated'],
      ['ENV-0008', 'PROP-MX-008', 'Acid rock drainage indicator','medium',   '2026-03-22', 'open'],
      ['ENV-0009', 'PROP-NV-009', 'Sage-grouse lek disturbance', 'high',     '2026-04-09', 'open'],
      ['ENV-0010', 'PROP-ZA-010', 'Heritage rock art near camp', 'medium',   '2026-03-02', 'mitigated'],
      ['ENV-0011', 'PROP-FI-011', 'Reindeer herding overlap',    'medium',   '2026-03-30', 'open'],
      ['ENV-0012', 'PROP-AR-012', 'Brine pond evaporation rate', 'high',     '2026-04-10', 'open'],
      ['ENV-0013', 'PROP-MN-013', 'Steppe groundwater table',    'medium',   '2026-02-26', 'open'],
      ['ENV-0014', 'PROP-PG-014', 'River turbidity uptick',      'high',     '2026-04-20', 'open'],
      ['ENV-0015', 'PROP-GH-015', 'Illegal galamsey overlap',    'high',     '2026-04-27', 'open'],
    ];
    for (const e of env) {
      await client.query(
        `INSERT INTO environmental_impacts (impact_id,property_id,type,severity,opened_at,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        e
      );
    }

    console.log('[seed] inserting indigenous_consultations...');
    const consults = [
      ['CON-0001', 'PROP-CA-001', 'Tahltan Central Government',         'IBA negotiation',    'in_progress',  '2026-03-22 14:00+00'],
      ['CON-0002', 'PROP-CA-002', 'Kaska Dena Council',                 'Engagement letter',  'open',         '2026-02-09 09:00+00'],
      ['CON-0003', 'PROP-PE-003', 'Comunidad Campesina Cerro Verde',    'Asamblea community', 'in_progress',  '2026-04-04 16:00+00'],
      ['CON-0004', 'PROP-AU-004', 'Nyamal People',                      'Heritage survey',    'completed',    '2026-02-18 10:00+00'],
      ['CON-0005', 'PROP-CL-005', 'Likanantai community',               'Aguas dialogue',     'in_progress',  '2026-03-30 11:00+00'],
      ['CON-0006', 'PROP-CD-006', 'Bakeya chiefdom',                    'Local benefit plan', 'open',         '2026-04-12 15:00+00'],
      ['CON-0007', 'PROP-BR-007', 'Xikrin do Bacaja',                   'FUNAI consultation', 'in_progress',  '2026-01-26 13:00+00'],
      ['CON-0008', 'PROP-MX-008', 'Yaqui community Vicam',              'Asamblea community', 'in_progress',  '2026-03-15 17:00+00'],
      ['CON-0009', 'PROP-NV-009', 'Western Shoshone',                   'Section 106 consult','open',         '2026-04-02 14:30+00'],
      ['CON-0010', 'PROP-ZA-010', 'Bafokeng Royal Nation',              'Royalty discussion', 'in_progress',  '2026-02-28 10:00+00'],
      ['CON-0011', 'PROP-FI-011', 'Sami Parliament (Samediggi)',        'Reindeer impact',    'open',         '2026-03-28 12:00+00'],
      ['CON-0012', 'PROP-AR-012', 'Atacamenos del Altiplano',           'Water rights',       'in_progress',  '2026-04-06 16:00+00'],
      ['CON-0013', 'PROP-MN-013', 'Local soum council',                 'Herder dialogue',    'open',         '2026-02-22 09:00+00'],
      ['CON-0014', 'PROP-PG-014', 'Engan landowners group',             'Land access',        'stalled',      '2026-04-18 11:00+00'],
      ['CON-0015', 'PROP-GH-015', 'Asantehene traditional authority',   'Chieftaincy brief',  'open',         '2026-04-25 14:00+00'],
    ];
    for (const c of consults) {
      await client.query(
        `INSERT INTO indigenous_consultations (consult_id,property_id,community,type,status,ts) VALUES ($1,$2,$3,$4,$5,$6)`,
        c
      );
    }

    console.log('[seed] inserting drill_targets...');
    const targets = [
      ['TGT-0001', 'PROP-CA-001', 'Hawkeye Main Vein extension', 'epithermal vein',    'high',     'approved'],
      ['TGT-0002', 'PROP-CA-001', 'Hawkeye South IP anomaly',    'chargeability',      'medium',   'proposed'],
      ['TGT-0003', 'PROP-CA-002', 'Caribou Stockwork',           'porphyry',           'high',     'approved'],
      ['TGT-0004', 'PROP-PE-003', 'Cerro Verde W-3',             'epithermal',         'high',     'proposed'],
      ['TGT-0005', 'PROP-AU-004', 'MBL Pegmatite east lobe',     'LCT pegmatite',      'high',     'approved'],
      ['TGT-0006', 'PROP-CL-005', 'ATC porphyry centre',         'porphyry',           'critical', 'approved'],
      ['TGT-0007', 'PROP-CD-006', 'Katanga T-2 EM conductor',    'sediment-hosted Cu', 'medium',   'on_hold'],
      ['TGT-0008', 'PROP-BR-007', 'Carajas Plateau B',           'BIF extension',      'medium',   'proposed'],
      ['TGT-0009', 'PROP-MX-008', 'Sonora vein swarm',           'epithermal Ag-Au',   'high',     'approved'],
      ['TGT-0010', 'PROP-NV-009', 'BMN sediment-hosted Au',      'Carlin-type',        'high',     'approved'],
      ['TGT-0011', 'PROP-ZA-010', 'Bushveld UG-2 step-out',      'PGE reef',           'high',     'approved'],
      ['TGT-0012', 'PROP-FI-011', 'Lapland VTEM-7 conductor',    'Ni-Cu massive sulf','critical',  'approved'],
      ['TGT-0013', 'PROP-AR-012', 'Salta brine cell',            'Li brine',           'medium',   'proposed'],
      ['TGT-0014', 'PROP-MN-013', 'Gobi REE carbonatite plug',   'REE carbonatite',    'high',     'approved'],
      ['TGT-0015', 'PROP-GH-015', 'Ashanti Shear north',         'orogenic Au',        'high',     'proposed'],
    ];
    for (const t of targets) {
      await client.query(
        `INSERT INTO drill_targets (target_id,property_id,name,target_type,priority,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        t
      );
    }

    console.log('[seed] inserting ndp_resource_estimates...');
    const estimates = [
      ['EST-0001', 'PROP-CA-001', 'Inferred',     1820000.00,   2.45,  true],
      ['EST-0002', 'PROP-CA-001', 'Indicated',     920000.00,   3.10,  true],
      ['EST-0003', 'PROP-CA-002', 'Inferred',    18400000.00,   0.42,  true],
      ['EST-0004', 'PROP-PE-003', 'Inferred',     6200000.00, 142.50,  true],
      ['EST-0005', 'PROP-AU-004', 'Indicated',   12800000.00,   1.15,  true],
      ['EST-0006', 'PROP-CL-005', 'Inferred',    92000000.00,   0.38,  true],
      ['EST-0007', 'PROP-CD-006', 'Inferred',     4800000.00,   0.62,  false],
      ['EST-0008', 'PROP-BR-007', 'Measured',   210000000.00,  58.20,  true],
      ['EST-0009', 'PROP-MX-008', 'Inferred',     3400000.00, 188.00,  true],
      ['EST-0010', 'PROP-NV-009', 'Indicated',    6200000.00,   1.85,  true],
      ['EST-0011', 'PROP-ZA-010', 'Measured',    24000000.00,   4.80,  true],
      ['EST-0012', 'PROP-FI-011', 'Inferred',     8200000.00,   1.20,  true],
      ['EST-0013', 'PROP-AR-012', 'Inferred',  1080000000.00, 480.00,  true],
      ['EST-0014', 'PROP-MN-013', 'Inferred',    18200000.00,  22000.0,true],
      ['EST-0015', 'PROP-GH-015', 'Indicated',    9400000.00,   2.95,  true],
    ];
    for (const e of estimates) {
      await client.query(
        `INSERT INTO ndp_resource_estimates (estimate_id,property_id,category,tonnes,grade,ndp_compliant) VALUES ($1,$2,$3,$4,$5,$6)`,
        e
      );
    }

    console.log('[seed] inserting expense_reports...');
    const expenses = [
      ['EXP-0001', 'PROP-CA-001', 'drilling',         412800.00, '2026-Q1', 'approved'],
      ['EXP-0002', 'PROP-CA-001', 'assay',             88400.00, '2026-Q1', 'approved'],
      ['EXP-0003', 'PROP-CA-002', 'drilling',         522000.00, '2026-Q1', 'approved'],
      ['EXP-0004', 'PROP-PE-003', 'geophysics',       210000.00, '2026-Q1', 'approved'],
      ['EXP-0005', 'PROP-AU-004', 'drilling',         385000.00, '2026-Q1', 'approved'],
      ['EXP-0006', 'PROP-CL-005', 'drilling',         640000.00, '2026-Q1', 'approved'],
      ['EXP-0007', 'PROP-CD-006', 'permits',           74000.00, '2026-Q1', 'pending'],
      ['EXP-0008', 'PROP-BR-007', 'consulting',        92000.00, '2026-Q1', 'approved'],
      ['EXP-0009', 'PROP-MX-008', 'camp_logistics',    61000.00, '2026-Q1', 'approved'],
      ['EXP-0010', 'PROP-NV-009', 'drilling',         298000.00, '2026-Q1', 'approved'],
      ['EXP-0011', 'PROP-ZA-010', 'environmental',     54000.00, '2026-Q1', 'approved'],
      ['EXP-0012', 'PROP-FI-011', 'geophysics',       186000.00, '2026-Q1', 'approved'],
      ['EXP-0013', 'PROP-AR-012', 'community',         42000.00, '2026-Q1', 'pending'],
      ['EXP-0014', 'PROP-MN-013', 'drilling',         182000.00, '2026-Q1', 'approved'],
      ['EXP-0015', 'PROP-GH-015', 'consulting',        38000.00, '2026-Q1', 'approved'],
    ];
    for (const e of expenses) {
      await client.query(
        `INSERT INTO expense_reports (expense_id,property_id,category,amount_usd,period,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        e
      );
    }

    console.log('[seed] inserting partners...');
    const partners = [
      ['PRT-001', 'Barrick Gold (option)',       'major_miner',      45.00, 'jv@barrick.example',         'active'],
      ['PRT-002', 'Newmont Corporation',         'major_miner',      30.00, 'jv@newmont.example',         'active'],
      ['PRT-003', 'Glencore Copper',             'major_miner',      51.00, 'partners@glencore.example',  'active'],
      ['PRT-004', 'BHP Xplor cohort',            'accelerator',       8.00, 'xplor@bhp.example',          'active'],
      ['PRT-005', 'Rio Tinto Exploration',       'major_miner',      40.00, 'rtxplore@riotinto.example',  'active'],
      ['PRT-006', 'Anglo American',              'major_miner',      35.00, 'partners@angloamerican.example','active'],
      ['PRT-007', 'Hyundai EV battery materials','off-take',         15.00, 'supply@hyundai.example',     'active'],
      ['PRT-008', 'CATL battery materials',      'off-take',         20.00, 'minerals@catl.example',      'active'],
      ['PRT-009', 'Equinox Gold',                'junior',           22.00, 'ir@equinox.example',         'active'],
      ['PRT-010', 'Sibanye-Stillwater',          'major_miner',      33.00, 'partners@sibanye.example',   'active'],
      ['PRT-011', 'Vale Base Metals',            'major_miner',      40.00, 'basemetals@vale.example',    'active'],
      ['PRT-012', 'LG Energy Solution',          'off-take',         18.00, 'minerals@lges.example',      'active'],
      ['PRT-013', 'Endeavour Mining',            'major_miner',      28.00, 'ir@endeavour.example',       'active'],
      ['PRT-014', 'IFC (World Bank)',            'finance',          12.00, 'mining@ifc.example',         'active'],
      ['PRT-015', 'EBRD',                        'finance',          10.00, 'minerals@ebrd.example',      'active'],
    ];
    for (const p of partners) {
      await client.query(
        `INSERT INTO partners (partner_id,name,type,ownership_pct,contact,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        p
      );
    }

    console.log('[seed] inserting audit_log...');
    const audits = [
      ['AUD-0001', 'admin@minexplore.io',     'PROP-CA-001',  'create',   'ok'],
      ['AUD-0002', 'geologist@minexplore.io', 'DDH-HAW-001',  'log_update','ok'],
      ['AUD-0003', 'admin@minexplore.io',     'CLM-0003',     'renew',    'ok'],
      ['AUD-0004', 'geologist@minexplore.io', 'AS-00004',     'import',   'ok'],
      ['AUD-0005', 'admin@minexplore.io',     'PERM-0006',    'submit',   'pending'],
      ['AUD-0006', 'viewer@minexplore.io',    'EST-0001',     'view',     'ok'],
      ['AUD-0007', 'geologist@minexplore.io', 'TGT-0006',     'approve',  'ok'],
      ['AUD-0008', 'admin@minexplore.io',     'CON-0004',     'close',    'ok'],
      ['AUD-0009', 'geologist@minexplore.io', 'GC-0008',      'send_lab', 'ok'],
      ['AUD-0010', 'admin@minexplore.io',     'EXP-0007',     'reject',   'rejected'],
      ['AUD-0011', 'geologist@minexplore.io', 'GP-2026-0012', 'plan',     'ok'],
      ['AUD-0012', 'admin@minexplore.io',     'PRT-001',      'sign_jv',  'ok'],
      ['AUD-0013', 'geologist@minexplore.io', 'ENV-0006',     'flag',     'escalated'],
      ['AUD-0014', 'admin@minexplore.io',     'PERM-0014',    'review',   'denied'],
      ['AUD-0015', 'viewer@minexplore.io',    'EST-0014',     'export',   'ok'],
    ];
    for (const a of audits) {
      await client.query(
        `INSERT INTO audit_log (entry_id,actor,target,action,result) VALUES ($1,$2,$3,$4,$5)`,
        a
      );
    }

    console.log('[seed] inserting users...');
    const users = [
      ['admin@minexplore.io',     'admin123',     'Admin',         'admin'],
      ['geologist@minexplore.io', 'geologist123', 'Lead Geologist','geologist'],
      ['viewer@minexplore.io',    'viewer123',    'Viewer',        'viewer'],
    ];
    for (const u of users) {
      await client.query(
        `INSERT INTO users (email,password,name,role) VALUES ($1,$2,$3,$4)`,
        u
      );
    }

    console.log('[seed] inserting notifications...');
    const notifications = [
      [1, 'Critical environmental flag',          'Katanga tailings precursor leak — escalated',                 'critical', 'environmental_impacts'],
      [1, 'High-grade assay returned',            'DDH-HAW-001 121.5-123.0m: Au 7.14 g/t',                       'high',     'assay_results'],
      [1, 'Permit denied (PNG)',                  'PROP-PG-014 EL renewal denied by MRA',                        'high',     'permits'],
      [2, 'New drill target approved',            'TGT-0012 Lapland VTEM-7 — drill schedule pending',            'medium',   'drill_targets'],
      [2, 'Indigenous consultation update',       'Cerro Verde asamblea community meeting scheduled',            'medium',   'indigenous_consultations'],
    ];
    for (const n of notifications) {
      await client.query(
        `INSERT INTO notifications (user_id,title,body,severity,source) VALUES ($1,$2,$3,$4,$5)`,
        n
      );
    }

    console.log('[seed] inserting webhooks...');
    const webhooks = [
      ['Exec board notifier', 'https://httpbin.org/post', 'sec_exec_2026',  'assay.high,environmental.critical', true],
      ['Tech committee feed', 'https://httpbin.org/post', 'sec_tc_2026',    'target.approved,resource.updated',  true],
    ];
    for (const w of webhooks) {
      await client.query(
        `INSERT INTO webhooks (name,url,secret,events,active) VALUES ($1,$2,$3,$4,$5)`,
        w
      );
    }

    console.log('[seed] complete.');
  } catch (e) {
    console.error('[seed] error:', e);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
