module.exports = (sequelize, DataTypes) => {
  const DailyEmail = sequelize.define('DailyEmail', {
    tickers: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  })

  return DailyEmail
}
