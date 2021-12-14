module.exports = (sequelize, DataTypes) => {
  const CreditTransaction = sequelize.define('CreditTransaction', {
    value: {
      type: DataTypes.NUMERIC,
      allowNull: false,
    },
    activated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    method: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    emailIdentifier: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  })

  CreditTransaction.associate = (models) => {
    CreditTransaction.belongsTo(models.User, {
      foreignKey: 'customerId',
      onDelete: 'CASCADE',
    })
  }

  return CreditTransaction
}
