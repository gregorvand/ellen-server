const Earning = require('../models').Earning

module.exports = {
  async getLastFourQuartersEarnings(ticker) {
    const earnings = await Earning.findAll({
      where: {
        ticker: ticker,
      },
      order: [['createdAt', 'DESC']],
      limit: 4,
    })

    return earnings
  },
}
