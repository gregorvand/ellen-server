module.exports = (sequelize, DataTypes) => {
  const Point = sequelize.define('Point', {
    pointsValue: { 
      type: DataTypes.INTEGER,
      allowNull: false
    },
    orderId: { 
      type: DataTypes.BIGINT,
      allowNull: true
    },
    activated: { 
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    reason: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  });

  Point.associate = (models) => {
    Point.belongsTo(models.User, {
      foreignKey: 'customerId',
      onDelete: 'CASCADE',
    });
  };

  return Point;
};