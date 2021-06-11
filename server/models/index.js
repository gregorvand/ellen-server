'use strict'
const env = process.env.NODE_ENV || 'development'
const pg = require('pg')

console.log('current ENV', process.env.NODE_ENV)

console.log('more env', env)
if (env != 'development') {
  pg.defaults.ssl = true
}

const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const basename = path.basename(__filename)
const config = require(__dirname + '/../config/config.json')[env]
const db = {}

let dialectOptions = false

if (env == 'production') {
  dialectOptions = { ssl: { rejectUnauthorized: false } }
}

let sequelize
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config, {
    logging: false,
  })
} else {
  console.log('Seq got here')
  sequelize = new Sequelize({
    dialect: 'postgres',
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
    database: config.database,
    sslmode: config.sslmode,
    dialectOptions: dialectOptions,
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
