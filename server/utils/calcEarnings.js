const Earning = require('../models').Earning

module.exports = {
  async getLastFourQuartersEarnings(ticker) {
    const earnings = await Earning.findAll({
      where: {
        ticker: ticker,
      },
      order: [['filingDate', 'DESC']],
      limit: 4,
    })

    return earnings
  },

  /**
   * Pass a set of earnings to get the difference between the first and second values
   * @param {Array} earnings : array of Seqelize objects that will have 'revenue' column
   *
   * @returns {Integer} Positive or Negative integer of percentage change. e.g. -5 [down 5%], 10 [up 10%], etc
   */
  calculateDifferenceOfEarnings(earnings) {
    const figureOne = earnings[0]?.dataValues.revenue
    const figureTwo = earnings[1]?.dataValues.revenue

    function percIncrease(a, b) {
      let percent
      if (b !== 0) {
        if (a !== 0) {
          percent = ((b - a) / a) * 100
        } else {
          percent = b * 100
        }
      } else {
        percent = -a * 100
      }
      return Math.floor(percent)
    }

    return percIncrease(figureTwo, figureOne)
  },
}
