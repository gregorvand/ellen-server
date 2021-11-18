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
    DatasetAccess.belongsTo(models.IndexedCompany, {
      foreignKey: 'emailIdentifier',
      onDelete: 'DO NOTHING',
    })
  }

  return DatasetAccess
}
