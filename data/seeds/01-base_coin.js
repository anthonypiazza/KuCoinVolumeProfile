
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('base_coin').truncate()
    .then(function () {
      // Inserts seed entries
      return knex('base_coin').insert([
        {id: 1, name: 'KCS'},
        {id: 2, name: 'SOUL'},
        {id: 3, name: 'NEO'},
      ]);
    });
};
