module.exports = (sequelize, DataTypes) => {
  const tsi_indexed_company = sequelize.define(
    'tsi_indexed_company',
    {
      from_domain: {
        type: DataTypes.STRING,
      },
      item_description: {
        type: DataTypes.STRING(100),
      },
      item_count: {
        type: DataTypes.SMALLINT,
      },
    },
    {
      indexes: [
        // Create a unique index on email
        {
          unique: true,
          fields: ['from_domain', 'item_description'],
        },
      ],
    }
  )

  return tsi_indexed_company
}
