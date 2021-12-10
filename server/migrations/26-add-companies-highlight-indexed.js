'use strict'

var Sequelize = require('sequelize')

/**
 * Actions summary:
 *
 * removeIndex "indexed_companies_email_identifier" from table "IndexedCompanies"
 * createTable "trending_companies", deps: [IndexedCompanies]
 * addColumn "highlight" to table "Companies"
 * addColumn "highlight" to table "IndexedCompanies"
 * changeColumn "password" on table "Users"
 * addIndex "indexed_companies_email_identifier_highlight" to table "IndexedCompanies"
 *
 **/

var info = {
  revision: 26,
  name: 'add-companies-highlight-indexed',
  created: '2021-12-10T00:02:46.018Z',
  comment: '',
}

var migrationCommands = function (transaction) {
  return [
    {
      fn: 'removeIndex',
      params: [
        'IndexedCompanies',
        'indexed_companies_email_identifier',
        {
          transaction: transaction,
        },
      ],
    },
    {
      fn: 'addColumn',
      params: [
        'Companies',
        'highlight',
        {
          type: Sequelize.BOOLEAN,
          field: 'highlight',
          defaultValue: false,
          allowNull: false,
        },
        {
          transaction: transaction,
        },
      ],
    },
    {
      fn: 'addColumn',
      params: [
        'IndexedCompanies',
        'highlight',
        {
          type: Sequelize.BOOLEAN,
          field: 'highlight',
          defaultValue: false,
          allowNull: false,
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
    {
      fn: 'addIndex',
      params: [
        'IndexedCompanies',
        ['emailIdentifier', 'highlight'],
        {
          indexName: 'indexed_companies_email_identifier_highlight',
          name: 'indexed_companies_email_identifier_highlight',
          indicesType: 'UNIQUE',
          type: 'UNIQUE',
          transaction: transaction,
        },
      ],
    },
  ]
}
var rollbackCommands = function (transaction) {
  return [
    {
      fn: 'removeIndex',
      params: [
        'IndexedCompanies',
        'indexed_companies_email_identifier_highlight',
        {
          transaction: transaction,
        },
      ],
    },
    {
      fn: 'removeColumn',
      params: [
        'Companies',
        'highlight',
        {
          transaction: transaction,
        },
      ],
    },
    {
      fn: 'removeColumn',
      params: [
        'IndexedCompanies',
        'highlight',
        {
          transaction: transaction,
        },
      ],
    },
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
    {
      fn: 'addIndex',
      params: [
        'IndexedCompanies',
        ['emailIdentifier'],
        {
          indexName: 'indexed_companies_email_identifier',
          name: 'indexed_companies_email_identifier',
          indicesType: 'UNIQUE',
          type: 'UNIQUE',
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
