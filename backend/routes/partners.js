const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'partners',
  fields: ['partner_id','name','type','ownership_pct','contact','status','notes'],
});
