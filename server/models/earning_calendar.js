module.exports = (sequelize, DataTypes) => {
  const EarningCalendar = sequelize.define('EarningCalendar', {
    ticker: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    quarter: {
      type: DataTypes.NUMERIC,
      allowNull: false,
    },
  })

  return EarningCalendar
}
