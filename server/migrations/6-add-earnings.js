'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "Earnings", deps: [Companies]
 * changeColumn "password" on table "Users"
 *
 **/

var info = {
    "revision": 6,
    "name": "add-earnings",
    "created": "2021-06-28T06:41:19.862Z",
    "comment": ""
};

var migrationCommands = function(transaction) {
    return [{
            fn: "createTable",
            params: [
                "Earnings",
                {
                    "id": {
                        "type": Sequelize.INTEGER,
                        "field": "id",
                        "autoIncrement": true,
                        "primaryKey": true,
                        "allowNull": false
                    },
                    "ticker": {
                        "type": Sequelize.STRING,
                        "field": "ticker",
                        "allowNull": false
                    },
                    "filingDate": {
                        "type": Sequelize.DATE,
                        "field": "filingDate",
                        "allowNull": false
                    },
                    "period": {
                        "type": Sequelize.STRING,
                        "field": "period",
                        "allowNull": false
                    },
                    "revenue": {
                        "type": Sequelize.BIGINT,
                        "field": "revenue"
                    },
                    "costOfRevenue": {
                        "type": Sequelize.BIGINT,
                        "field": "costOfRevenue"
                    },
                    "grossProfit": {
                        "type": Sequelize.BIGINT,
                        "field": "grossProfit"
                    },
                    "grossProfitRatio": {
                        "type": Sequelize.DECIMAL,
                        "field": "grossProfitRatio"
                    },
                    "ebitda": {
                        "type": Sequelize.BIGINT,
                        "field": "ebitda"
                    },
                    "ebitdaRatio": {
                        "type": Sequelize.DECIMAL,
                        "field": "ebitdaRatio"
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
                    },
                    "companyId": {
                        "type": Sequelize.INTEGER,
                        "field": "companyId",
                        "onUpdate": "CASCADE",
                        "onDelete": "CASCADE",
                        "references": {
                            "model": "Companies",
                            "key": "id"
                        },
                        "allowNull": true
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
            params: ["Earnings", {
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
