module.exports = (sequelize, DataTypes) => {
  const DatasetAccess = sequelize.define('DatasetAccess', {
    datasetId: {
      type: DataTypes.NUMERIC,
      allowNull: false,
    },
    expiry: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  })

  DatasetAccess.associate = (models) => {
    DatasetAccess.belongsTo(models.User, {
      foreignKey: 'customerId',
      onDelete: 'CASCADE',
    })
    DatasetAccess.belongsTo(models.Company, {
      foreignKey: 'companyId',
      onDelete: 'CASCADE',
    })
  }

  return DatasetAccess
}
