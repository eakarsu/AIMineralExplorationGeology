const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'geochem_samples',
  fields: ['sample_id','property_id','type','location','taken_at','status','notes'],
});
