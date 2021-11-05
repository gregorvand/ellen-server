module.exports = (sequelize, DataTypes) => {
  const EdisonOrderIndexed = sequelize.define(
    'EdisonOrderIndexed',
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
        allowNull: true,
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

  return EdisonOrderIndexed
}
