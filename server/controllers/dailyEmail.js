const DailyEmail = require('../models').DailyEmail

// For adding tickers to DB that should be emailed that day
module.exports = {
  async create(tickers, date = new Date()) {
    const existingEmailEntry = await DailyEmail.count({
      where: {
        tickers: tickers,
      },
    })
    try {
      if (existingEmailEntry == 0) {
        return DailyEmail.create({
          tickers: tickers,
          date: date,
        })
      } else {
        return 'skipping email entry - already added for today'
      }
    } catch (e) {
      console.error(e)
    }
  },

  unsent() {
    return DailyEmail.findAll({
      where: {
        sent: false,
      },
      order: [['createdAt', 'ASC']],
    })
  },

  updateStatus(id) {
    return DailyEmail.update(
      {
        sent: true,
      },
      {
        where: { id: id },
      }
    )
  },
}
