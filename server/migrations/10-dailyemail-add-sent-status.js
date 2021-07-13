'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "sent" to table "DailyEmails"
 * changeColumn "password" on table "Users"
 *
 **/

var info = {
    "revision": 10,
    "name": "dailyemail-add-sent-status",
    "created": "2021-07-13T09:52:27.925Z",
    "comment": ""
};

var migrationCommands = function(transaction) {
    return [{
            fn: "addColumn",
            params: [
                "DailyEmails",
                "sent",
                {
                    "type": Sequelize.BOOLEAN,
                    "field": "sent",
                    "defaultValue": false,
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
            fn: "removeColumn",
            params: [
                "DailyEmails",
                "sent",
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
