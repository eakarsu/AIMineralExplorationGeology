const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'properties',
  fields: ['property_id','name','country','area_km2','commodity_target','status','notes'],
});
