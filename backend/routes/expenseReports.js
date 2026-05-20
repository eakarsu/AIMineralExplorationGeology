const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'expense_reports',
  fields: ['expense_id','property_id','category','amount_usd','period','status','notes'],
});
