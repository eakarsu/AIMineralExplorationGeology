const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'contractors',
  fields: ['contractor_id','name','service','country','rate_usd_day','status','notes'],
});
