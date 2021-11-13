'use strict'
const env = process.env.NODE_ENV || 'development'
const pg = require('pg')

console.log('current ENV', process.env.NODE_ENV)

console.log('more env', env)
// if (env != 'development') {
//   pg.defaults.ssl = true
// }

const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const basename = path.basename(__filename)
const config = require(__dirname + '/../config/config.js')[env]
const db = {}

let dialectOptions = false

if (env == 'production') {
  dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
    useUTC: false,
  }
}

let sequelize
if (config.use_env_variable) {
  console.log('using env var')
  sequelize = new Sequelize(process.env[config.use_env_variable], config, {
    logging: true,
  })
} else {
  console.log('init Sequelizezzz', process.env.PROD_DB_PASS) // does not work?
  sequelize = new Sequelize({
    dialect: 'postgres',
    host: config.host,
    port: config.port,
    username: config.username,
    password: process.env.PROD_DB_PASS,
    database: config.database,
    sslmode: config.sslmode,
    dialectOptions: dialectOptions,
    logging: false,
    timezone: '+08:00',
    pool: {
      max: 15,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  })
}

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
    )
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    )
    db[model.name] = model
  })

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
