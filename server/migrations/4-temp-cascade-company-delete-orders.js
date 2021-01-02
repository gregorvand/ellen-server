'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * changeColumn "companyId" on table "Orders"
 * changeColumn "password" on table "Users"
 *
 **/

var info = {
    "revision": 4,
    "name": "temp-cascade-company-delete-orders",
    "created": "2021-01-02T04:48:54.158Z",
    "comment": ""
};

var migrationCommands = function(transaction) {
    return [{
            fn: "changeColumn",
            params: [
                "Orders",
                "companyId",
                {
                    "type": Sequelize.INTEGER,
                    "field": "companyId",
                    "onUpdate": "CASCADE",
                    "onDelete": "cascade",
                    "references": {
                        "model": "Companies",
                        "key": "id"
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
            fn: "changeColumn",
            params: [
                "Orders",
                "companyId",
                {
                    "type": Sequelize.INTEGER,
                    "field": "companyId",
                    "onUpdate": "CASCADE",
                    "onDelete": "SET NULL",
                    "references": {
                        "model": "Companies",
                        "key": "id"
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
