'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "edison_receipts_monthly_calcs", deps: []
 * changeColumn "password" on table "Users"
 *
 **/

var info = {
    "revision": 29,
    "name": "ADD-edison_receipts_monthly_calc-use-strings-LONGER",
    "created": "2022-01-08T07:15:56.823Z",
    "comment": ""
};

var migrationCommands = function(transaction) {
    return [{
            fn: "createTable",
            params: [
                "edison_receipts_monthly_calcs",
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
                    "order_pickup": {
                        "type": Sequelize.SMALLINT,
                        "field": "order_pickup"
                    },
                    "order_total_amount": {
                        "type": Sequelize.STRING,
                        "field": "order_total_amount",
                        "allowNull": true
                    },
                    "order_shipping": {
                        "type": Sequelize.STRING,
                        "field": "order_shipping",
                        "allowNull": true
                    },
                    "order_tax": {
                        "type": Sequelize.STRING,
                        "field": "order_tax",
                        "allowNull": true
                    },
                    "order_subtotal": {
                        "type": Sequelize.STRING,
                        "field": "order_subtotal"
                    },
                    "order_total_qty": {
                        "type": Sequelize.SMALLINT,
                        "field": "order_total_qty"
                    },
                    "item_description": {
                        "type": Sequelize.STRING(500),
                        "field": "item_description"
                    },
                    "item_subtitle": {
                        "type": Sequelize.STRING(500),
                        "field": "item_subtitle"
                    },
                    "item_quantity": {
                        "type": Sequelize.SMALLINT,
                        "field": "item_quantity"
                    },
                    "item_price": {
                        "type": Sequelize.STRING,
                        "field": "item_price",
                        "allowNull": true
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
            params: ["edison_receipts_monthly_calcs", {
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
