
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(64),
      is: /^[0-9a-f]{64}$/i,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      default: "pending",
    },
    identifier: {
      type: DataTypes.STRING,
    },
    username: {
      type: DataTypes.STRING,
    },
  });
  
  User.associate = (models) => {
    User.hasMany(models.Order, {
      foreignKey: 'customerId',
      as: 'orders',
    });
    User.hasMany(models.Point, {
      foreignKey: 'customerId',
      as: 'points',
    });
    raw: true
  };
  return User;
};