// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './dev.sqlite3' // O arquivo do banco será criado aqui
    },
    useNullAsDefault: true // Necessário para o SQLite no Knex
  }
};