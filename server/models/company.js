module.exports = (sequelize, DataTypes) => {
  const Company = sequelize.define('Company', {
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
    companyType: {
      type: DataTypes.STRING,
      validate: {
        isIn: [['private', 'public']],
      },
      allowNull: true,
    },
    ticker: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sector: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    industry: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    exchangeShortName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  })

  Company.associate = (models) => {
    Company.hasMany(models.Order, {
      foreignKey: 'companyId',
      as: 'orders',
      onDelete: 'CASCADE',
    })
    Company.hasMany(models.Earning, {
      foreignKey: 'companyId',
      as: 'earnings',
      onDelete: 'CASCADE',
    })
    Company.hasMany(models.DatasetAccess, {
      foreignKey: 'companyId',
      as: 'datasets',
    })
    Company.belongsToMany(models.User, { through: 'UserCompanies' })
    Company.belongsToMany(models.CompanyCategory, {
      through: 'CategoryListings',
    })
  }
  return Company
}
