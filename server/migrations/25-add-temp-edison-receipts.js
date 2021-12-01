'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "edison_receipts_temps", deps: []
 * changeColumn "password" on table "Users"
 *
 **/

var info = {
    "revision": 25,
    "name": "add-temp-edison-receipts",
    "created": "2021-11-27T08:41:27.219Z",
    "comment": ""
};

var migrationCommands = function(transaction) {
    return [{
            fn: "createTable",
            params: [
                "edison_receipts_temps",
                {
                    "id": {
                        "type": Sequelize.INTEGER,
                        "field": "id",
                        "autoIncrement": true,
                        "primaryKey": true,
                        "allowNull": false
                    },
                    "merchant_name": {
                        "type": Sequelize.STRING,
                        "field": "merchant_name"
                    },
                    "user_id": {
                        "type": Sequelize.STRING,
                        "field": "user_id"
                    },
                    "order_number": {
                        "type": Sequelize.STRING,
                        "field": "order_number"
                    },
                    "order_time": {
                        "type": Sequelize.STRING,
                        "field": "order_time"
                    },
                    "email_time": {
                        "type": Sequelize.STRING,
                        "field": "email_time"
                    },
                    "update_time": {
                        "type": Sequelize.STRING,
                        "field": "update_time"
                    },
                    "insert_time": {
                        "type": Sequelize.STRING,
                        "field": "insert_time"
                    },
                    "checksum": {
                        "type": Sequelize.STRING,
                        "field": "checksum"
                    },
                    "item_reseller": {
                        "type": Sequelize.STRING,
                        "field": "item_reseller"
                    },
                    "from_domain": {
                        "type": Sequelize.STRING,
                        "field": "from_domain"
                    },
                    "email_subject": {
                        "type": Sequelize.STRING,
                        "field": "email_subject"
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
            params: ["edison_receipts_temps", {
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
