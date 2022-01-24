'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * removeIndex "act_indexed_companies_from_domain_act_value" from table "act_indexed_companies"
 * changeColumn "password" on table "Users"
 * addIndex "act_indexed_companies_from_domain" to table "act_indexed_companies"
 *
 **/

var info = {
    "revision": 32,
    "name": "act_indexed_co-REMOVE-act-index",
    "created": "2022-01-24T09:00:06.653Z",
    "comment": ""
};

var migrationCommands = function(transaction) {
    return [{
            fn: "removeIndex",
            params: [
                "act_indexed_companies",
                "act_indexed_companies_from_domain_act_value",
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
        },
        {
            fn: "addIndex",
            params: [
                "act_indexed_companies",
                ["from_domain"],
                {
                    "indexName": "act_indexed_companies_from_domain",
                    "name": "act_indexed_companies_from_domain",
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
            fn: "removeIndex",
            params: [
                "act_indexed_companies",
                "act_indexed_companies_from_domain",
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
        },
        {
            fn: "addIndex",
            params: [
                "act_indexed_companies",
                ["from_domain", "act_value"],
                {
                    "indexName": "act_indexed_companies_from_domain_act_value",
                    "name": "act_indexed_companies_from_domain_act_value",
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
