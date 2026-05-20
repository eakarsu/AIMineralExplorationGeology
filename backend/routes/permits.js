const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'permits',
  fields: ['permit_id','property_id','authority','type','status','issued_at','notes'],
});
