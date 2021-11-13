module.exports = (sequelize, DataTypes) => {
  const IndexedCompany = sequelize.define(
    'IndexedCompany',
    {
      nameIdentifier: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      emailIdentifier: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      orderPrefix: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      orderSuffix: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      industry: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      data_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      indexes: [
        // Create a unique index on email
        {
          unique: true,
          fields: ['emailIdentifier'],
        },
      ],
    }
  )
  return IndexedCompany
}