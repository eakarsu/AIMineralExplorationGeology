const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'assay_results',
  fields: ['assay_id','hole_id','from_m','to_m','element','value_ppm','notes'],
});
