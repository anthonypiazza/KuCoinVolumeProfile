
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('paired_coin').truncate()
    .then(function () {
      // Inserts seed entries
      return knex('paired_coin').insert([
        {id: 1, name: 'USDT'},
        {id: 2, name: 'USDC'},
        {id: 3, name: 'USDS'},
      ]);
    });
};
