const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'indigenous_consultations',
  fields: ['consult_id','property_id','community','type','status','ts','notes'],
});
