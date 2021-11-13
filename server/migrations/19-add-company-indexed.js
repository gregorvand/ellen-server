'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "IndexedCompanies", deps: []
 * changeColumn "password" on table "Users"
 * addIndex "indexed_companies_email_identifier_name_identifier" to table "IndexedCompanies"
 *
 **/

var info = {
    "revision": 19,
    "name": "add-company-indexed",
    "created": "2021-11-12T10:32:25.113Z",
    "comment": ""
};

var migrationCommands = function(transaction) {
    return [{
            fn: "createTable",
            params: [
                "IndexedCompanies",
                {
                    "id": {
                        "type": Sequelize.INTEGER,
                        "field": "id",
                        "autoIncrement": true,
                        "primaryKey": true,
                        "allowNull": false
                    },
                    "nameIdentifier": {
                        "type": Sequelize.STRING,
                        "field": "nameIdentifier",
                        "allowNull": false
                    },
                    "emailIdentifier": {
                        "type": Sequelize.STRING,
                        "field": "emailIdentifier",
                        "allowNull": false
                    },
                    "orderPrefix": {
                        "type": Sequelize.STRING,
                        "field": "orderPrefix",
                        "allowNull": false
                    },
                    "orderSuffix": {
                        "type": Sequelize.STRING,
                        "field": "orderSuffix",
                        "allowNull": true
                    },
                    "industry": {
                        "type": Sequelize.STRING,
                        "field": "industry",
                        "allowNull": true
                    },
                    "data_verified": {
                        "type": Sequelize.BOOLEAN,
                        "field": "data_verified",
                        "defaultValue": false,
                        "allowNull": false
                    },
                    "createdAt": {
                        "type": Sequelize.DATE,
                        "field": "createdAt",
                        "allowNull": false
                    },
                    "updatedAt": {
                        "type": Sequelize.DATE,
                        "field": "updatedAt",
                        "allowNull": false
                    }
                },
                {
                    "transaction": transaction
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
var rollbackCommands = function(transaction) {
    return [{
            fn: "dropTable",
            params: ["IndexedCompanies", {
                transaction: transaction
            }]
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
