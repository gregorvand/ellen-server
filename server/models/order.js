module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    orderNumber: { 
      type: DataTypes.INTEGER,
      allowNull: false
    },
    orderDate: {
      type: DataTypes.STRING,
      allowNull: false
    }, 
    fromEmail: {
      type: DataTypes.STRING,
      allowNull: false
    }, 
    customerEmail: {
      type: DataTypes.STRING,
      allowNull: false
    },
    plainContent: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    totalValue: DataTypes.INTEGER,
    currency: DataTypes.STRING
  });

  Order.associate = (models) => {
    Order.belongsTo(models.Company, {
      foreignKey: 'companyId',
      onDelete: 'RESTRICT',
    });
  };

  return Order;
};