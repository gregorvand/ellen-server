'use strict'

var Sequelize = require('sequelize')

/**
 * Actions summary:
 *
 * createTable "CompanyCategories", deps: []
 * createTable "CategoryListings", deps: [Companies, CompanyCategories]
 * createTable "UserCategories", deps: [CompanyCategories, Users]
 * changeColumn "password" on table "Users"
 *
 **/

var info = {
  revision: 2,
  name: 'add-companyCategories',
  created: '2021-07-22T02:24:36.919Z',
  comment: '',
}

var migrationCommands = function (transaction) {
  return [
    {
      fn: 'createTable',
      params: [
        'CompanyCategories',
        {
          id: {
            type: Sequelize.INTEGER,
            field: 'id',
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },
          name: {
            type: Sequelize.STRING,
            field: 'name',
            allowNull: false,
          },
          metaData: {
            type: Sequelize.ARRAY(Sequelize.STRING),
            field: 'metaData',
            allowNull: true,
          },
          createdAt: {
            type: Sequelize.DATE,
            field: 'createdAt',
            allowNull: false,
          },
          updatedAt: {
            type: Sequelize.DATE,
            field: 'updatedAt',
            allowNull: false,
          },
        },
        {
          transaction: transaction,
        },
      ],
    },
    {
      fn: 'createTable',
      params: [
        'CategoryListings',
        {
          createdAt: {
            type: Sequelize.DATE,
            field: 'createdAt',
            allowNull: false,
          },
          updatedAt: {
            type: Sequelize.DATE,
            field: 'updatedAt',
            allowNull: false,
          },
          CompanyId: {
            type: Sequelize.INTEGER,
            field: 'CompanyId',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
            references: {
              model: 'Companies',
              key: 'id',
            },
            primaryKey: true,
          },
          CompanyCategoryId: {
            type: Sequelize.INTEGER,
            field: 'CompanyCategoryId',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
            references: {
              model: 'CompanyCategories',
              key: 'id',
            },
            primaryKey: true,
          },
        },
        {
          transaction: transaction,
        },
      ],
    },
    {
      fn: 'createTable',
      params: [
        'UserCategories',
        {
          createdAt: {
            type: Sequelize.DATE,
            field: 'createdAt',
            allowNull: false,
          },
          updatedAt: {
            type: Sequelize.DATE,
            field: 'updatedAt',
            allowNull: false,
          },
          CompanyCategoryId: {
            type: Sequelize.INTEGER,
            field: 'CompanyCategoryId',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
            references: {
              model: 'CompanyCategories',
              key: 'id',
            },
            primaryKey: true,
          },
          UserId: {
            type: Sequelize.INTEGER,
            field: 'UserId',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
            references: {
              model: 'Users',
              key: 'id',
            },
            primaryKey: true,
          },
        },
        {
          transaction: transaction,
        },
      ],
    },
    {
      fn: 'changeColumn',
      params: [
        'Users',
        'password',
        {
          type: Sequelize.STRING(64),
          field: 'password',
          allowNull: false,
          is: {},
        },
        {
          transaction: transaction,
        },
      ],
    },
  ]
}
var rollbackCommands = function (transaction) {
  return [
    {
      fn: 'dropTable',
      params: [
        'CompanyCategories',
        {
          transaction: transaction,
        },
      ],
    },
    {
      fn: 'dropTable',
      params: [
        'CategoryListings',
        {
          transaction: transaction,
        },
      ],
    },
    {
      fn: 'dropTable',
      params: [
        'UserCategories',
        {
          transaction: transaction,
        },
      ],
    },
    {
      fn: 'changeColumn',
      params: [
        'Users',
        'password',
        {
          type: Sequelize.STRING(64),
          field: 'password',
          allowNull: false,
          is: {},
        },
        {
          transaction: transaction,
        },
      ],
    },
  ]
}

module.exports = {
  pos: 0,
  useTransaction: true,
  execute: function (queryInterface, Sequelize, _commands) {
    var index = this.pos
    function run(transaction) {
      const commands = _commands(transaction)
      return new Promise(function (resolve, reject) {
        function next() {
          if (index < commands.length) {
            let command = commands[index]
            console.log('[#' + index + '] execute: ' + command.fn)
            index++
            queryInterface[command.fn]
              .apply(queryInterface, command.params)
              .then(next, reject)
          } else resolve()
        }
        next()
      })
    }
    if (this.useTransaction) {
      return queryInterface.sequelize.transaction(run)
    } else {
      return run(null)
    }
  },
  up: function (queryInterface, Sequelize) {
    return this.execute(queryInterface, Sequelize, migrationCommands)
  },
  down: function (queryInterface, Sequelize) {
    return this.execute(queryInterface, Sequelize, rollbackCommands)
  },
  info: info,
}
