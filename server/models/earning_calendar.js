module.exports = (sequelize, DataTypes) => {
  const EarningCalendar = sequelize.define('EarningCalendar', {
    ticker: {
      type: DataTypes.STRING,
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
    storedEarning: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  })

  EarningCalendar.associate = (models) => {
    EarningCalendar.hasOne(models.Earning, {
      foreignKey: 'earningCalendarId',
      as: 'earning',
      onDelete: 'CASCADE',
    })
  }

  return EarningCalendar
}
