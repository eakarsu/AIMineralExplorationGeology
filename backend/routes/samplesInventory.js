const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'samples_inventory',
  fields: ['inv_id','sample_id','location','qa_status','sent_to','ts','notes'],
});
