module.exports = (sequelize, DataTypes) => {
  const IndexedEdisonOrders = sequelize.define(
    'IndexedEdisonOrders',
    {
      orderNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      emailDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      fromDomain: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      indexes: [
        // Create a unique index on orderNumber and fromDomain
        {
          unique: true,
          fields: ['orderNumber', 'fromDomain'],
        },
      ],
    }
  )

  return IndexedEdisonOrders
}
