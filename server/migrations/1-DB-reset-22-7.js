'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "Companies", deps: []
 * createTable "DailyEmails", deps: []
 * createTable "EarningCalendars", deps: []
 * createTable "Users", deps: []
 * createTable "Earnings", deps: [Companies, EarningCalendars]
 * createTable "Orders", deps: [Companies, Users]
 * createTable "Points", deps: [Orders, Users]
 * createTable "Winners", deps: [Users]
 * createTable "UserCompanies", deps: [Companies, Users]
 *
 **/

var info = {
    "revision": 1,
    "name": "DB-reset-22-7",
    "created": "2021-07-22T02:16:34.118Z",
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
                    "companyType": {
                        "type": Sequelize.STRING,
                        "field": "companyType",
                        "allowNull": true
                    },
                    "ticker": {
                        "type": Sequelize.STRING,
                        "field": "ticker",
                        "allowNull": true
                    },
                    "sector": {
                        "type": Sequelize.STRING,
                        "field": "sector",
                        "allowNull": true
                    },
                    "industry": {
                        "type": Sequelize.STRING,
                        "field": "industry",
                        "allowNull": true
                    },
                    "exchangeShortName": {
                        "type": Sequelize.STRING,
                        "field": "exchangeShortName",
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
                "DailyEmails",
                {
                    "id": {
                        "type": Sequelize.INTEGER,
                        "field": "id",
                        "autoIncrement": true,
                        "primaryKey": true,
                        "allowNull": false
                    },
                    "tickers": {
                        "type": Sequelize.ARRAY(Sequelize.STRING),
                        "field": "tickers",
                        "allowNull": false
                    },
                    "date": {
                        "type": Sequelize.DATE,
                        "field": "date",
                        "allowNull": false
                    },
                    "sent": {
                        "type": Sequelize.BOOLEAN,
                        "field": "sent",
                        "defaultValue": false,
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
                "EarningCalendars",
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
                    "date": {
                        "type": Sequelize.DATE,
                        "field": "date",
                        "allowNull": false
                    },
                    "quarter": {
                        "type": Sequelize.DECIMAL,
                        "field": "quarter",
                        "allowNull": false
                    },
                    "storedEarning": {
                        "type": Sequelize.BOOLEAN,
                        "field": "storedEarning",
                        "defaultValue": false,
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
                        "allowNull": true
                    },
                    "lastName": {
                        "type": Sequelize.STRING,
                        "field": "lastName",
                        "allowNull": true
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
                    "identifier": {
                        "type": Sequelize.STRING,
                        "field": "identifier"
                    },
                    "username": {
                        "type": Sequelize.STRING,
                        "field": "username"
                    },
                    "activated": {
                        "type": Sequelize.BOOLEAN,
                        "field": "activated",
                        "default": false
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
                        "type": Sequelize.DECIMAL,
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
                    },
                    "earningCalendarId": {
                        "type": Sequelize.INTEGER,
                        "field": "earningCalendarId",
                        "onUpdate": "CASCADE",
                        "onDelete": "CASCADE",
                        "references": {
                            "model": "EarningCalendars",
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
                        "type": Sequelize.BIGINT,
                        "field": "orderNumber",
                        "allowNull": false
                    },
                    "orderDate": {
                        "type": Sequelize.DATE,
                        "field": "orderDate",
                        "allowNull": true
                    },
                    "fromEmail": {
                        "type": Sequelize.STRING,
                        "field": "fromEmail",
                        "allowNull": true
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
                    "subjectLine": {
                        "type": Sequelize.TEXT,
                        "field": "subjectLine",
                        "allowNull": true
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
                        "onDelete": "CASCADE",
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
                        "onDelete": "CASCADE",
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
                "Points",
                {
                    "id": {
                        "type": Sequelize.INTEGER,
                        "field": "id",
                        "autoIncrement": true,
                        "primaryKey": true,
                        "allowNull": false
                    },
                    "pointsValue": {
                        "type": Sequelize.INTEGER,
                        "field": "pointsValue",
                        "allowNull": false
                    },
                    "activated": {
                        "type": Sequelize.BOOLEAN,
                        "field": "activated",
                        "defaultValue": false,
                        "allowNull": false
                    },
                    "reason": {
                        "type": Sequelize.INTEGER,
                        "field": "reason",
                        "defaultValue": 1,
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
                    },
                    "emailId": {
                        "type": Sequelize.INTEGER,
                        "field": "emailId",
                        "onUpdate": "CASCADE",
                        "onDelete": "SET NULL",
                        "references": {
                            "model": "Orders",
                            "key": "id"
                        },
                        "allowNull": true
                    },
                    "customerId": {
                        "type": Sequelize.INTEGER,
                        "field": "customerId",
                        "onUpdate": "CASCADE",
                        "onDelete": "CASCADE",
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
                "Winners",
                {
                    "id": {
                        "type": Sequelize.INTEGER,
                        "field": "id",
                        "autoIncrement": true,
                        "primaryKey": true,
                        "allowNull": false
                    },
                    "endDate": {
                        "type": Sequelize.DATE,
                        "field": "endDate",
                        "allowNull": false
                    },
                    "prizeType": {
                        "type": Sequelize.STRING,
                        "field": "prizeType",
                        "allowNull": false
                    },
                    "prizeValue": {
                        "type": Sequelize.INTEGER,
                        "field": "prizeValue",
                        "allowNull": true
                    },
                    "prizePosition": {
                        "type": Sequelize.INTEGER,
                        "field": "prizePosition",
                        "defaultValue": 0,
                        "allowNull": false
                    },
                    "pointsAtWin": {
                        "type": Sequelize.INTEGER,
                        "field": "pointsAtWin",
                        "defaultValue": 0,
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
                    },
                    "customerId": {
                        "type": Sequelize.INTEGER,
                        "field": "customerId",
                        "onUpdate": "CASCADE",
                        "onDelete": "CASCADE",
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
                "UserCompanies",
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
                    "CompanyId": {
                        "type": Sequelize.INTEGER,
                        "field": "CompanyId",
                        "onUpdate": "CASCADE",
                        "onDelete": "CASCADE",
                        "references": {
                            "model": "Companies",
                            "key": "id"
                        },
                        "primaryKey": true
                    },
                    "UserId": {
                        "type": Sequelize.INTEGER,
                        "field": "UserId",
                        "onUpdate": "CASCADE",
                        "onDelete": "CASCADE",
                        "references": {
                            "model": "Users",
                            "key": "id"
                        },
                        "primaryKey": true
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
            params: ["DailyEmails", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["EarningCalendars", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["Earnings", {
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
            params: ["Points", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["Users", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["Winners", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["UserCompanies", {
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
