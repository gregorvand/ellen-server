const EarningCalendar = require('../models').EarningCalendar
const Company = require('../models').Company

const { Op } = require('sequelize')

const {
  allEarningsByPeriod,
} = require('../services/earnings/companyEarningsService')

const getAndStore = async function (req, res) {
  const companyList = await allEarningsByPeriod()
  checkAndCreate(companyList.data)
}

// check if Ellen DB has company in DB
// then check if we already have this earning event recorded
// store if not
const checkAndCreate = async function (req, res) {
  const allCalendarResults = req.earningsCalendar

  let allCreations = []
  const promises = allCalendarResults.map(async (calendarResult) => {
    // Lookup our DB first before making requests for reports, to reduce requests out to FMP

    const thisDate = new Date(calendarResult.date)

    const ellenCompany = await Company.count({
      where: { ticker: calendarResult.symbol },
    })

    const alreadyStored = await EarningCalendar.count({
      where: {
        [Op.and]: [{ ticker: calendarResult.symbol }, { date: thisDate }],
      },
    })

    if (ellenCompany !== 0 && alreadyStored === 0) {
      const createEarning = await EarningCalendar.create({
        ticker: calendarResult.symbol,
        date: thisDate,
        quarter: calendarResult.quarter,
      })
      return createEarning
    } else {
      return Promise.resolve()
    }
  })

  const allCompleted = await Promise.all(promises)
  const response = allCompleted.filter((value) => value !== undefined)
  console.log(response)
}

// console test
getAndStore()

module.exports = {
  create: checkAndCreate,
  getAndStore: getAndStore,
}
