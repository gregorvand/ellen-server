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
      type: DataTypes.INTEGER,
      allowNull: true
    },
    prizePosition: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    pointsAtWin: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
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