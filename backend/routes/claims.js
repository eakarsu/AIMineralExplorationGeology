const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'claims',
  fields: ['claim_id','property_id','claim_number','area_ha','expires_at','status','notes'],
});
