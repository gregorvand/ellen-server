module.exports = (sequelize, DataTypes) => {
  const EdisonOrder = sequelize.define('EdisonOrder', {
    userId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    orderNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    emailDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fromDomain: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    itemReseller: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    checksum: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    subjectLine: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  })

  return EdisonOrder
}
