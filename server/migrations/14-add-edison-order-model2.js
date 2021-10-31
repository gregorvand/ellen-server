'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "EdisonOrders", deps: []
 * changeColumn "password" on table "Users"
 *
 **/

var info = {
    "revision": 14,
    "name": "add-edison-order-model2",
    "created": "2021-10-27T07:28:19.552Z",
    "comment": ""
};

var migrationCommands = function(transaction) {
    return [{
            fn: "createTable",
            params: [
                "EdisonOrders",
                {
                    "id": {
                        "type": Sequelize.INTEGER,
                        "field": "id",
                        "autoIncrement": true,
                        "primaryKey": true,
                        "allowNull": false
                    },
                    "userId": {
                        "type": Sequelize.STRING,
                        "field": "userId",
                        "allowNull": true
                    },
                    "orderNumber": {
                        "type": Sequelize.STRING,
                        "field": "orderNumber",
                        "allowNull": false
                    },
                    "emailDate": {
                        "type": Sequelize.DATE,
                        "field": "emailDate",
                        "allowNull": false
                    },
                    "fromDomain": {
                        "type": Sequelize.STRING,
                        "field": "fromDomain",
                        "allowNull": true
                    },
                    "itemReseller": {
                        "type": Sequelize.STRING,
                        "field": "itemReseller",
                        "allowNull": false
                    },
                    "checksum": {
                        "type": Sequelize.TEXT,
                        "field": "checksum",
                        "allowNull": false
                    },
                    "subjectLine": {
                        "type": Sequelize.TEXT,
                        "field": "subjectLine",
                        "allowNull": true
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
        }
    ];
};
var rollbackCommands = function(transaction) {
    return [{
            fn: "dropTable",
            params: ["EdisonOrders", {
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
