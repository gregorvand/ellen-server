'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "emailIdentifier" to table "DatasetAccesses"
 * changeColumn "password" on table "Users"
 *
 **/

var info = {
    "revision": 23,
    "name": "associate-indexed-company-datasetaccess-email",
    "created": "2021-11-18T07:21:34.949Z",
    "comment": ""
};

var migrationCommands = function(transaction) {
    return [{
            fn: "addColumn",
            params: [
                "DatasetAccesses",
                "emailIdentifier",
                {
                    "type": Sequelize.STRING,
                    "field": "emailIdentifier",
                    "onUpdate": "CASCADE",
                    "onDelete": "SET NULL",
                    "references": {
                        "model": "IndexedCompanies",
                        "key": "emailIdentifier"
                    },
                    "allowNull": true
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
            fn: "removeColumn",
            params: [
                "DatasetAccesses",
                "emailIdentifier",
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
