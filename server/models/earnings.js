module.exports = (sequelize, DataTypes) => {
  const Earning = sequelize.define('Earning', {
    ticker: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    filingDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    period: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    revenue: {
      type: DataTypes.BIGINT,
    },
    costOfRevenue: {
      type: DataTypes.BIGINT,
    },
    grossProfit: {
      type: DataTypes.BIGINT,
    },
    grossProfitRatio: {
      type: DataTypes.NUMERIC,
    },
    ebitda: {
      type: DataTypes.NUMERIC,
    },
    ebitdaRatio: {
      type: DataTypes.NUMERIC,
    },
  })

  Earning.associate = (models) => {
    Earning.belongsTo(models.Company, {
      foreignKey: 'companyId',
      onDelete: 'CASCADE',
    })
  }
  return Earning
}
