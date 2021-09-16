module.exports = (sequelize, DataTypes) => {
  const DatasetAccess = sequelize.define('DatasetAccess', {
    datasetId: {
      type: DataTypes.INTEGER,
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
  }

  return DatasetAccess
}
