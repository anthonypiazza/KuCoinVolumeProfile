
exports.up = function(knex) {
  return knex.schema
    .createTable('base_coin', tbl => {
        tbl.increments('id')
        tbl.text('name')
        .notNullable();
    })
};

exports.down = function(knex) {
    return knex.schema
    .dropTableIfExists('base_coin')
};
