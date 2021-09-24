module.exports = (sequelize, DataTypes) => {
  const Subscription = sequelize.define('Subscription', {
    stripe_sub_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    current_period_end: {
      type: DataTypes.NUMERIC,
      allowNull: false,
    },
    customer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  })

  Subscription.associate = (models) => {
    Subscription.belongsTo(models.User, {
      foreignKey: 'customerId',
      onDelete: 'CASCADE',
    })
  }

  return Subscription
}
