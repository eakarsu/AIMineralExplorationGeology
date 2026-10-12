import { useEffect, useState } from 'react';
import { propertiesApi, drillHolesApi, geophysicsSurveysApi, indigenousConsultationsApi } from '../services/api';

const sourceApis = { property_id: propertiesApi, hole_id: drillHolesApi, survey_id: geophysicsSurveysApi, community: indigenousConsultationsApi };
export const hasNativeSource = key => Object.hasOwn(sourceApis, key);
const same = (a, b) => String(a) === String(b);
const present = value => value !== null && value !== undefined && String(value).trim() !== '';
const sourceLabel = (key, row) => String(row[key]) + (row.name ? ' · ' + row.name : row.method ? ' · ' + row.method : '');

export function useNativeSourceRecords(inputs = []) {
  const signature = inputs.filter(field => hasNativeSource(field.key)).map(field => field.key).sort().join(',');
  const [state, setState] = useState({ signature: '', loading: false, rows: {}, errors: {} });
  useEffect(() => {
    if (!signature) { setState({ signature, loading: false, rows: {}, errors: {} }); return undefined; }
    const controller = new AbortController();
    setState({ signature, loading: true, rows: {}, errors: {} });
    const keys = signature.split(',');
    Promise.allSettled(keys.map(key => sourceApis[key].list({ signal: controller.signal }))).then(results => {
      if (controller.signal.aborted) return;
      const rows = {}, errors = {};
      results.forEach((result, index) => {
        const key = keys[index];
        if (result.status === 'rejected') { rows[key] = []; errors[key] = result.reason?.message || 'Could not load accessible saved sources.'; return; }
        const data = result.value, list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : null;
        if (!list) { rows[key] = []; errors[key] = 'The source API returned an invalid record list. Reload the page or sign in again.'; return; }
        const seen = new Set();
        rows[key] = list.filter(row => { if (!row || typeof row !== 'object' || !present(row[key])) return false; const identity = String(row[key]) + (key === 'community' ? '|' + String(row.property_id || '') : ''); if (seen.has(identity)) return false; seen.add(identity); return true; });
      });
      setState({ signature, loading: false, rows, errors });
    });
    return () => controller.abort();
  }, [signature]);
  return state.signature === signature ? state : { signature, loading: Boolean(signature), rows: {}, errors: {} };
}

export function withNativeSourceOptions(fields, records, values) {
  return fields.map(field => {
    if (!hasNativeSource(field.key)) return field;
    let rows = records.rows[field.key] || [];
    if (['hole_id', 'community'].includes(field.key) && present(values.property_id)) rows = rows.filter(row => same(row.property_id, values.property_id));
    return { ...field, requiresExistingRecord: true, nativeSource: true, options: rows.map(row => ({ value: String(row[field.key]), label: sourceLabel(field.key, row) })) };
  });
}

export function sourcePrerequisite(fields, records, values) {
  const actual = fields.filter(field => field.nativeSource);
  if (!actual.length) return '';
  if (records.loading) return 'Loading actual accessible property, drill-hole, survey or documented consultation records…';
  const failed = actual.find(field => records.errors[field.key]);
  if (failed) return failed.label + ': ' + records.errors[failed.key];
  const empty = actual.find(field => !field.options.length);
  if (empty) return 'Load an accessible saved record for ' + empty.label + ' before filling the entire example. No source ID is invented.';
  const invalid = actual.find(field => present(values[field.key]) && !field.options.some(option => same(option.value, values[field.key])));
  return invalid ? 'The selected ' + invalid.label + ' is unavailable or does not match the selected property. Choose an actual matching source.' : '';
}

export function bindNativeReferenceExample(fields, filled, current, records, variant, manualFields) {
  const keys = new Set(fields.map(field => field.key));
  if (keys.has('property_id') && !present(current.property_id)) {
    const eligible = (records.rows.property_id || []).filter(row => (!keys.has('hole_id') || (records.rows.hole_id || []).some(hole => same(hole.property_id, row.property_id))) && (!keys.has('country') || present(row.country)) && (!keys.has('community') || (records.rows.community || []).some(item => same(item.property_id, row.property_id))));
    if (!eligible.length) throw new Error('No accessible saved property has every required source fact and linked drill hole. Select and verify an actual source manually.');
    filled.property_id = String(eligible[variant % eligible.length].property_id);
  }
  if (keys.has('property_id') && keys.has('hole_id')) {
    const manualHole = (records.rows.hole_id || []).find(row => same(row.hole_id, current.hole_id));
    if (!present(current.property_id) && manualHole && present(manualHole.property_id)) filled.property_id = String(manualHole.property_id);
    const matching = (records.rows.hole_id || []).filter(row => same(row.property_id, filled.property_id));
    if (!matching.length) throw new Error('The selected property has no accessible saved drill hole. Choose a matching property before filling both source fields.');
    const existing = matching.find(row => same(row.hole_id, current.hole_id));
    filled.hole_id = String((existing || matching[variant % matching.length]).hole_id);
  }
  if (keys.has('community')) {
    const matching = (records.rows.community || []).filter(row => !keys.has('property_id') || same(row.property_id, filled.property_id));
    if (!matching.length) throw new Error('The selected property has no accessible documented community consultation. Choose or document an actual source before filling this field.');
    const existing = matching.find(row => same(row.community, current.community));
    filled.community = String((existing || matching[variant % matching.length]).community);
  }
  if (keys.has('country') && present(filled.property_id)) {
    const property = (records.rows.property_id || []).find(row => same(row.property_id, filled.property_id));
    const manual = manualFields.country && same(current.property_id, filled.property_id) && present(current.country);
    if (manual) filled.country = current.country;
    else if (present(property?.country)) filled.country = property.country;
    else throw new Error('The selected property has no documented country. Enter a verified jurisdiction manually before using a complete example.');
  }
  return filled;
}

export function changeNativeReference(inputs, initial, values, key, value, records) {
  const next = { ...initial };
  for (const field of inputs) if (hasNativeSource(field.key)) next[field.key] = values[field.key] || '';
  next[key] = value;
  if (key === 'property_id' && next.hole_id) {
    const hole = (records.rows.hole_id || []).find(row => same(row.hole_id, next.hole_id));
    if (!hole || !same(hole.property_id, value)) next.hole_id = '';
  }
  if (key === 'property_id' && next.community) {
    if (!(records.rows.community || []).some(row => same(row.community, next.community) && same(row.property_id, value))) next.community = '';
  }
  if (key === 'community' && value && inputs.some(field => field.key === 'property_id')) {
    const consultation = (records.rows.community || []).find(row => same(row.community, value) && (!present(values.property_id) || same(row.property_id, values.property_id)));
    if (consultation && present(consultation.property_id)) next.property_id = String(consultation.property_id);
  }
  if (key === 'hole_id' && value && inputs.some(field => field.key === 'property_id')) {
    const hole = (records.rows.hole_id || []).find(row => same(row.hole_id, value));
    if (hole && present(hole.property_id)) next.property_id = String(hole.property_id);
  }
  return next;
}
