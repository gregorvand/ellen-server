'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * removeColumn "id" from table "IndexedCompanies"
 * createTable "UserIndexedCompanies", deps: [IndexedCompanies, Users]
 * changeColumn "emailIdentifier" on table "IndexedCompanies"
 * changeColumn "password" on table "Users"
 *
 **/

var info = {
    "revision": 21,
    "name": "associate-indexed-company-user-emailIdentifier2",
    "created": "2021-11-18T04:53:57.290Z",
    "comment": ""
};

var migrationCommands = function(transaction) {
    return [{
            fn: "removeColumn",
            params: [
                "IndexedCompanies",
                "id",
                {
                    transaction: transaction
                }
            ]
        },
        {
            fn: "createTable",
            params: [
                "UserIndexedCompanies",
                {
                    "createdAt": {
                        "type": Sequelize.DATE,
                        "field": "createdAt",
                        "allowNull": false
                    },
                    "updatedAt": {
                        "type": Sequelize.DATE,
                        "field": "updatedAt",
                        "allowNull": false
                    },
                    "emailIdentifier": {
                        "type": Sequelize.STRING,
                        "onUpdate": "CASCADE",
                        "onDelete": "CASCADE",
                        "references": {
                            "model": "IndexedCompanies",
                            "key": "emailIdentifier"
                        },
                        "field": "emailIdentifier",
                        "primaryKey": true
                    },
                    "UserId": {
                        "type": Sequelize.INTEGER,
                        "onUpdate": "CASCADE",
                        "onDelete": "CASCADE",
                        "references": {
                            "model": "Users",
                            "key": "id"
                        },
                        "field": "UserId",
                        "primaryKey": true
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
                "IndexedCompanies",
                "emailIdentifier",
                {
                    "type": Sequelize.STRING,
                    "field": "emailIdentifier",
                    "primaryKey": true,
                    "unique": true,
                    "allowNull": false
                },
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
        }
    ];
};
var rollbackCommands = function(transaction) {
    return [{
            fn: "dropTable",
            params: ["UserIndexedCompanies", {
                transaction: transaction
            }]
        },
        {
            fn: "addColumn",
            params: [
                "IndexedCompanies",
                "id",
                {
                    "type": Sequelize.INTEGER,
                    "field": "id",
                    "autoIncrement": true,
                    "primaryKey": true,
                    "allowNull": false
                },
                {
                    transaction: transaction
                }
            ]
        },
        {
            fn: "changeColumn",
            params: [
                "IndexedCompanies",
                "emailIdentifier",
                {
                    "type": Sequelize.STRING,
                    "field": "emailIdentifier",
                    "allowNull": false
                },
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
