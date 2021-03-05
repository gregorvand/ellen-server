module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    orderNumber: { 
      type: DataTypes.INTEGER,
      allowNull: false
    },
    orderDate: {
      type: DataTypes.DATE,
      allowNull: true
    }, 
    fromEmail: {
      type: DataTypes.STRING,
      allowNull: true
    }, 
    customerEmail: {
      type: DataTypes.STRING,
      allowNull: false
    },
    plainContent: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    subjectLine: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    totalValue: DataTypes.INTEGER,
    currency: DataTypes.STRING
  });

  Order.associate = (models) => {
    Order.belongsTo(models.Company, {
      foreignKey: 'companyId',
      onDelete: 'CASCADE',
    });
    Order.belongsTo(models.User, { 
      foreignKey: 'customerId',
      onDelete: 'CASCADE', 
    });
  };

  return Order;
};