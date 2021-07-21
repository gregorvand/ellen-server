const EarningCalendar = require('../models').EarningCalendar
const Company = require('../models').Company

const { Op } = require('sequelize')

const {
  allEarningsByPeriod,
} = require('../services/earnings/companyEarningsService')

const getUpcomingEarnings = async function (req, res) {
  const awaitedEarnings = await EarningCalendar.findAll({
    where: {
      storedEarning: false,
    },
    order: [['date', 'ASC']],
  })

  res.send(awaitedEarnings)
}

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
    const thisYear = thisDate.getFullYear()

    const ellenCompany = await Company.count({
      where: { ticker: calendarResult.symbol },
    })

    // Beacause API returns multiple entries per company,
    // A subsequent pull may then try to add another entry for same ticker/year/quarter
    // This stops it being added if ticker/year/quarter match
    const sequelize = require('sequelize')
    const alreadyStored = await EarningCalendar.count({
      where: {
        [Op.and]: [
          { ticker: calendarResult.symbol },
          { quarter: calendarResult.quarter },
          sequelize.where(
            sequelize.fn('date_part', 'year', sequelize.col('date')),
            thisYear
          ),
        ],
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
  getUpcomingEarnings: getUpcomingEarnings,
  validate: validate,
}
