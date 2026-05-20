const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'geophysics_surveys',
  fields: ['survey_id','property_id','method','vendor','completed_at','status','notes'],
});
