const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'ndp_resource_estimates',
  fields: ['estimate_id','property_id','category','tonnes','grade','ndp_compliant','notes'],
});
