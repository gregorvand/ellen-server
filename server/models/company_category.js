module.exports = (sequelize, DataTypes) => {
  const CompanyCategory = sequelize.define('CompanyCategory', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    metaData: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
  })

  CompanyCategory.associate = (models) => {
    CompanyCategory.belongsToMany(models.User, { through: 'UserCategories' })
    CompanyCategory.belongsToMany(models.Company, {
      through: 'CategoryListings',
    })
  }

  return CompanyCategory
}
