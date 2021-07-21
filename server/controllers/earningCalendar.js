const EarningCalendar = require('../models').EarningCalendar
const Company = require('../models').Company

const { Op } = require('sequelize')

const {
  allEarningsByPeriod,
} = require('../services/earnings/companyEarningsService')

const getAndStoreCalendarEvents = async function (req, res) {
  console.log('looking for new cal events')
  const companyList = await allEarningsByPeriod()
  checkAndCreate(companyList.data)
}

// check if Ellen DB has company in DB
// then check if we already have this earning event recorded
// store if not
const { removeDuplicates } = require('../utils/helpers')
const checkAndCreate = async function (req, res) {
  const allCalendarResults = req.earningsCalendar

  const filteredallCalendarResults = removeDuplicates(
    allCalendarResults,
    'symbol'
  )

  const promises = filteredallCalendarResults.map(async (calendarResult) => {
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

const validate = async function (ticker) {
  const entry = await EarningCalendar.findOne({
    where: {
      ticker: ticker,
    },
    order: [['date', 'ASC']],
  })

  entry.storedEarning = true
  entry.save()
}

// console test
// getAndStoreCalendarEvents()

module.exports = {
  create: checkAndCreate,
  getAndStoreCalendarEvents: getAndStoreCalendarEvents,
  validate: validate,
}
