'use strict'

var Sequelize = require('sequelize')

/**
 * Actions summary:
 *
 * dropTable "trending_companies"
 * addColumn "emailIdentifier" to table "CreditTransactions"
 * changeColumn "password" on table "Users"
 *
 **/

var info = {
  revision: 27,
  name: 'add-company-identifier-transactions',
  created: '2021-12-14T07:43:18.990Z',
  comment: '',
}

var migrationCommands = function (transaction) {
  return [
    {
      fn: 'dropTable',
      params: [
        'trending_companies',
        {
          transaction: transaction,
        },
      ],
    },
    {
      fn: 'addColumn',
      params: [
        'CreditTransactions',
        'emailIdentifier',
        {
          type: Sequelize.STRING,
          field: 'emailIdentifier',
          allowNull: true,
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
      fn: 'removeColumn',
      params: [
        'CreditTransactions',
        'emailIdentifier',
        {
          transaction: transaction,
        },
      ],
    },
    {
      fn: 'createTable',
      params: [
        'trending_companies',
        {
          id: {
            type: Sequelize.INTEGER,
            field: 'id',
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },
          email_identifier: {
            type: Sequelize.STRING,
            field: 'email_identifier',
            allowNull: false,
          },
          meta_data: {
            type: Sequelize.ARRAY(Sequelize.STRING),
            field: 'meta_data',
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
          IndexedCompanyEmailIdentifier: {
            type: Sequelize.STRING,
            field: 'IndexedCompanyEmailIdentifier',
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
            references: {
              model: 'IndexedCompanies',
              key: 'emailIdentifier',
            },
            allowNull: true,
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
