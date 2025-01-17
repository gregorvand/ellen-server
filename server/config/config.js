require('dotenv').config()
module.exports = {
  development: {
    username: 'postgres',
    password: null,
    database: 'todos-dev',
    host: '127.0.0.1',
    port: 5432,
    dialect: 'postgres',
  },
  production: {
    username: 'doadmin',
    password: `${process.env.PROD_DB_PASS}`,
    database: 'todos-dev',
    host: 'db-postgresql-sfo2-79931-do-user-8723588-0.b.db.ondigitalocean.com',
    port: 25060,
    dialect: 'postgres',
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
}
