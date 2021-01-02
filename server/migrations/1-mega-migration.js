'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "Companies", deps: []
 * createTable "Todos", deps: []
 * createTable "Users", deps: []
 * createTable "Orders", deps: [Companies, Users]
 * createTable "TodoItems", deps: [Todos]
 *
 **/

var info = {
    "revision": 1,
    "name": "mega-migration",
    "created": "2021-01-02T02:08:18.565Z",
    "comment": ""
};

var migrationCommands = function(transaction) {
    return [{
            fn: "createTable",
            params: [
                "Companies",
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
            fn: "createTable",
            params: [
                "Todos",
                {
                    "id": {
                        "type": Sequelize.INTEGER,
                        "field": "id",
                        "autoIncrement": true,
                        "primaryKey": true,
                        "allowNull": false
                    },
                    "title": {
                        "type": Sequelize.STRING,
                        "field": "title",
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
            fn: "createTable",
            params: [
                "Users",
                {
                    "id": {
                        "type": Sequelize.INTEGER,
                        "field": "id",
                        "autoIncrement": true,
                        "primaryKey": true,
                        "allowNull": false
                    },
                    "firstName": {
                        "type": Sequelize.STRING,
                        "field": "firstName",
                        "allowNull": false
                    },
                    "lastName": {
                        "type": Sequelize.STRING,
                        "field": "lastName",
                        "allowNull": false
                    },
                    "email": {
                        "type": Sequelize.STRING,
                        "field": "email",
                        "unique": true,
                        "allowNull": false
                    },
                    "password": {
                        "type": Sequelize.STRING(64),
                        "field": "password",
                        "allowNull": false,
                        "is": {}
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
            fn: "createTable",
            params: [
                "Orders",
                {
                    "id": {
                        "type": Sequelize.INTEGER,
                        "field": "id",
                        "autoIncrement": true,
                        "primaryKey": true,
                        "allowNull": false
                    },
                    "orderNumber": {
                        "type": Sequelize.INTEGER,
                        "field": "orderNumber",
                        "allowNull": false
                    },
                    "orderDate": {
                        "type": Sequelize.STRING,
                        "field": "orderDate",
                        "allowNull": false
                    },
                    "fromEmail": {
                        "type": Sequelize.STRING,
                        "field": "fromEmail",
                        "allowNull": false
                    },
                    "customerEmail": {
                        "type": Sequelize.STRING,
                        "field": "customerEmail",
                        "allowNull": false
                    },
                    "plainContent": {
                        "type": Sequelize.TEXT,
                        "field": "plainContent",
                        "allowNull": false
                    },
                    "totalValue": {
                        "type": Sequelize.INTEGER,
                        "field": "totalValue"
                    },
                    "currency": {
                        "type": Sequelize.STRING,
                        "field": "currency"
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
                        "onDelete": "SET NULL",
                        "references": {
                            "model": "Companies",
                            "key": "id"
                        },
                        "allowNull": true
                    },
                    "customerId": {
                        "type": Sequelize.INTEGER,
                        "field": "customerId",
                        "onUpdate": "CASCADE",
                        "onDelete": "NO ACTION",
                        "references": {
                            "model": "Users",
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
            fn: "createTable",
            params: [
                "TodoItems",
                {
                    "id": {
                        "type": Sequelize.INTEGER,
                        "field": "id",
                        "autoIncrement": true,
                        "primaryKey": true,
                        "allowNull": false
                    },
                    "content": {
                        "type": Sequelize.STRING,
                        "field": "content",
                        "allowNull": false
                    },
                    "complete": {
                        "type": Sequelize.BOOLEAN,
                        "field": "complete",
                        "defaultValue": false
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
                    "todoId": {
                        "type": Sequelize.INTEGER,
                        "field": "todoId",
                        "onUpdate": "CASCADE",
                        "onDelete": "SET NULL",
                        "references": {
                            "model": "Todos",
                            "key": "id"
                        },
                        "allowNull": true
                    }
                },
                {
                    "transaction": transaction
                }
            ]
        }
    ];
};
var rollbackCommands = function(transaction) {
    return [{
            fn: "dropTable",
            params: ["Companies", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["Orders", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["Todos", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["TodoItems", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["Users", {
                transaction: transaction
            }]
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
