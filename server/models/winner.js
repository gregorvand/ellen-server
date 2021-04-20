module.exports = (sequelize, DataTypes) => {
  const Winner = sequelize.define('Winner', {
    endDate: { 
      type: DataTypes.DATE,
      allowNull: false
    },
    prizeType: { 
      type: DataTypes.STRING,
      allowNull: false
    },
    prizeValue: { 
      type: DataTypes.INT,
      allowNull: true,
      defaultValue: false
    },
    prizePosition: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    pointsAtWin: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
  });

  Winner.associate = (models) => {
    Winner.belongsTo(models.User, {
      foreignKey: 'customerId',
      onDelete: 'CASCADE',
    });
  };

  return Winner;
};