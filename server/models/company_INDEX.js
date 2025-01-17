module.exports = (sequelize, DataTypes) => {
  const IndexedCompany = sequelize.define(
    'IndexedCompany',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
      },
      nameIdentifier: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      emailIdentifier: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
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
      highlight: {
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
          fields: ['emailIdentifier', 'highlight'],
        },
      ],
    }
  )
  IndexedCompany.associate = (models) => {
    IndexedCompany.belongsToMany(models.User, {
      through: 'UserIndexedCompanies',
      foreignKey: 'emailIdentifier',
      constraints: false,
    })
    IndexedCompany.hasMany(models.DatasetAccess, {
      foreignKey: 'emailIdentifier',
      as: 'datasets',
    })
  }

  return IndexedCompany
}
