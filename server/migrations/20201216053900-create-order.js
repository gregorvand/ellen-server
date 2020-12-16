'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      orderNumber: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      orderDate: {
        type: Sequelize.STRING,
        allowNull: false
      },
      totalValue: {
        type: Sequelize.INTEGER
      },
      currency: {
        type: Sequelize.STRING
      },
      fromEmail: {
        type: Sequelize.STRING,
        allowNull: false
      },
      customerEmail: {
        type: Sequelize.STRING,
        allowNull: false
      },
      plainContent: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      companyId: {
        type: Sequelize.INTEGER,
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        references: {
          model: 'Companies',
          key: 'id',
          as: 'companyId',
        },
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Orders');
  }
};