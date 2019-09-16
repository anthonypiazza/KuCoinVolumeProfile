
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('paired_base').truncate()
    .then(function () {
      // Inserts seed entries
      return knex('paired_base').insert([
        {
          id: 1, 
          base_coin_id: 1,
          paired_coin_id: 1,
          va_high: 30.44,
          va_low: 20.33,
        },
        {
          id: 2, 
          base_coin_id: 2,
          paired_coin_id: 2,
          va_high: 28.6666,
          va_low: 19.44,
        },
        {
          id: 3, 
          base_coin_id: 3,
          paired_coin_id: 3,
          va_high: 20.22,
          va_low: 10.33,
        },
      ]);
    });
};
