const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'drill_targets',
  fields: ['target_id','property_id','name','target_type','priority','status','notes'],
});
