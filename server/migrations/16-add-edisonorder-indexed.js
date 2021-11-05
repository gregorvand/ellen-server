'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * dropTable "EdisonOrderIndexeds"
 * createTable "IndexedEdisonOrders", deps: []
 * changeColumn "password" on table "Users"
 * addIndex "indexed_edison_orders_order_number_from_domain" to table "IndexedEdisonOrders"
 *
 **/

var info = {
    "revision": 16,
    "name": "add-edisonorder-indexed",
    "created": "2021-11-05T04:42:24.796Z",
    "comment": ""
};

var migrationCommands = function(transaction) {
    return [{
            fn: "dropTable",
            params: ["EdisonOrderIndexeds", {
                transaction: transaction
            }]
        },
        {
            fn: "createTable",
            params: [
                "IndexedEdisonOrders",
                {
                    "id": {
                        "type": Sequelize.INTEGER,
                        "field": "id",
                        "autoIncrement": true,
                        "primaryKey": true,
                        "allowNull": false
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
                "IndexedEdisonOrders",
                ["orderNumber", "fromDomain"],
                {
                    "indexName": "indexed_edison_orders_order_number_from_domain",
                    "name": "indexed_edison_orders_order_number_from_domain",
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
            params: ["IndexedEdisonOrders", {
                transaction: transaction
            }]
        },
        {
            fn: "createTable",
            params: [
                "EdisonOrderIndexeds",
                {
                    "id": {
                        "type": Sequelize.INTEGER,
                        "field": "id",
                        "autoIncrement": true,
                        "primaryKey": true,
                        "allowNull": false
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
                "EdisonOrderIndexeds",
                ["orderNumber", "fromDomain"],
                {
                    "indexName": "edison_order_indexeds_order_number_from_domain",
                    "name": "edison_order_indexeds_order_number_from_domain",
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
