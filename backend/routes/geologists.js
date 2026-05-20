const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'geologists',
  fields: ['geo_id','name','specialty','base','status','contact','notes'],
});
