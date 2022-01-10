module.exports = (sequelize, DataTypes) => {
  const aov_indexed_company = sequelize.define(
    'aov_indexed_company',
    {
      from_domain: {
        type: DataTypes.STRING,
      },
      aov_period: {
        type: DataTypes.DATE,
      },
      aov_value: {
        type: DataTypes.FLOAT,
      },
    },
    {
      indexes: [
        // Create a unique index on email
        {
          unique: true,
          fields: ['from_domain', 'aov_period'],
        },
      ],
    }
  )

  return aov_indexed_company
}
