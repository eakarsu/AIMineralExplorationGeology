const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'geological_logs',
  fields: ['log_id','hole_id','from_m','to_m','lithology','structure','notes'],
});
