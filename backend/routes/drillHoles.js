const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'drill_holes',
  fields: ['hole_id','property_id','collar_e','collar_n','depth_m','status','notes'],
});
