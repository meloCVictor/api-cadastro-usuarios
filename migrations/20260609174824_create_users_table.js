/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // Cria a tabela 'users'
  return knex.schema.createTable('users', table => {
    table.increments('id').primary(); // ID automático
    table.string('email').notNullable().unique(); // Email obrigatório e único
    table.string('password').notNullable(); // Senha obrigatória (guardaremos o hash)
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // Desfaz a criação da tabela (útil para reverter alterações)
  return knex.schema.dropTable('users');
};
