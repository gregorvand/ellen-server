'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * removeIndex "indexed_companies_email_identifier_name_identifier" from table "IndexedCompanies"
 * changeColumn "password" on table "Users"
 * addIndex "indexed_companies_email_identifier" to table "IndexedCompanies"
 *
 **/

var info = {
    "revision": 20,
    "name": "add-company-indexed-email-unique",
    "created": "2021-11-12T11:05:33.877Z",
    "comment": ""
};

var migrationCommands = function(transaction) {
    return [{
            fn: "removeIndex",
            params: [
                "IndexedCompanies",
                "indexed_companies_email_identifier_name_identifier",
                {
                    transaction: transaction
                }
            ]
        },
        {
            fn: "changeColumn",
            params: [
                "Users",
                "password",
                {
                    "type": Sequelize.STRING(64),
                    "field": "password",
                    "allowNull": false,
                    "is": {}
                },
                {
                    transaction: transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "IndexedCompanies",
                ["emailIdentifier"],
                {
                    "indexName": "indexed_companies_email_identifier",
                    "name": "indexed_companies_email_identifier",
                    "indicesType": "UNIQUE",
                    "type": "UNIQUE",
                    "transaction": transaction
                }
            ]
        }
    ];
};
var rollbackCommands = function(transaction) {
    return [{
            fn: "removeIndex",
            params: [
                "IndexedCompanies",
                "indexed_companies_email_identifier",
                {
                    transaction: transaction
                }
            ]
        },
        {
            fn: "changeColumn",
            params: [
                "Users",
                "password",
                {
                    "type": Sequelize.STRING(64),
                    "field": "password",
                    "allowNull": false,
                    "is": {}
                },
                {
                    transaction: transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "IndexedCompanies",
                ["emailIdentifier", "nameIdentifier"],
                {
                    "indexName": "indexed_companies_email_identifier_name_identifier",
                    "name": "indexed_companies_email_identifier_name_identifier",
                    "indicesType": "UNIQUE",
                    "type": "UNIQUE",
                    "transaction": transaction
                }
            ]
        }
    ];
};

module.exports = {
    pos: 0,
    useTransaction: true,
    execute: function(queryInterface, Sequelize, _commands)
    {
        var index = this.pos;
        function run(transaction) {
            const commands = _commands(transaction);
            return new Promise(function(resolve, reject) {
                function next() {
                    if (index < commands.length)
                    {
                        let command = commands[index];
                        console.log("[#"+index+"] execute: " + command.fn);
                        index++;
                        queryInterface[command.fn].apply(queryInterface, command.params).then(next, reject);
                    }
                    else
                        resolve();
                }
                next();
            });
        }
        if (this.useTransaction) {
            return queryInterface.sequelize.transaction(run);
        } else {
            return run(null);
        }
    },
    up: function(queryInterface, Sequelize)
    {
        return this.execute(queryInterface, Sequelize, migrationCommands);
    },
    down: function(queryInterface, Sequelize)
    {
        return this.execute(queryInterface, Sequelize, rollbackCommands);
    },
    info: info
};
