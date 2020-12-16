module.exports = (sequelize, DataTypes) => {
  const Company = sequelize.define('Company', {
    nameIdentifier: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    emailIdentifier: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    orderPrefix: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    orderSuffix: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });
  
  Company.associate = (models) => {
    Company.hasMany(models.Order, {
      foreignKey: 'companyId',
      as: 'orders',
    });
  };
  return Company;
};