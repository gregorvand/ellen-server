module.exports = (sequelize, DataTypes) => {
  const act_indexed_company = sequelize.define(
    'act_indexed_company',
    {
      from_domain: {
        type: DataTypes.STRING,
      },
      act_value: {
        type: DataTypes.FLOAT,
      },
    },
    {
      indexes: [
        // Create a unique index on email
        {
          unique: true,
          fields: ['from_domain'],
        },
      ],
    }
  )

  return act_indexed_company
}
