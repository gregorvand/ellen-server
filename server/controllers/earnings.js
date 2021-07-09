const Earning = require('../models').Earning
const Company = require('../models').Company
// const User = require('../models').User
const jwt = require('jsonwebtoken')
const Today = require('../utils/getToday')
const { Op } = require('sequelize')

const { getUsersFromCompanies } = require('../controllers/companies')
const { removeDuplicates } = require('../utils/helpers')

const dayjs = require('dayjs')

const {
  companyEarningBySymbol,
  allEarningsByPeriod,
} = require('../services/earnings/companyEarningsService')

const { sendAnEmail } = require('../services/email/sendgrid')

module.exports = {
  addQuarterlyEarning(req, res) {
    jwt.verify(req.token, process.env.USER_AUTH_SECRET, (err) => {
      if (err) {
        res.sendStatus(401)
      } else {
        let reqBody = req.body
        earningCreate(reqBody, res)
          .then((company) => res.status(201).send(company))
          .catch((error) => res.status(400).send(error))
      }
    })
  },
  getRecentEarnings(req, res) {
    jwt.verify(req.token, process.env.USER_AUTH_SECRET, (err) => {
      if (err) {
        res.sendStatus(401)
      } else {
        allEarningsByPeriod().then((result) => {
          // API returns duplicates, filter these out first based on symbol (ticker) name
          const filteredResult = removeDuplicates(
            result.data.earningsCalendar,
            'symbol'
          )
          res.send(filteredResult)
        })
      }
    })
  },

  getQuarterlyEarnings(req, res) {
    jwt.verify(req.token, process.env.USER_AUTH_SECRET, (err) => {
      if (err) {
        res.sendStatus(401)
      } else {
        companyEarningBySymbol(req.body.ticker).then((result) => {
          res.send(result.data)
        })
      }
    })
  },

  // get all symbols
  // return success to indicate received and processing
  // make requests for each set of earnings
  // store earning
  // on to the next

  async getAndStoreQuarterlyEarnings(req, res) {
    // gets all symbols in one request and store array of all calendar entries
    const companyList = await allEarningsByPeriod()
    const allCalendarResults = companyList.data.earningsCalendar

    // now make many requests for each company and store any earnigns that match period from calendar
    allCalendarResults.forEach(async (calendarResult) => {
      // Lookup our DB first before making requests for reports, to reduce requests out to FMP
      const ellenCompany = await Company.findOne({
        where: { ticker: calendarResult.symbol },
      })

      if (ellenCompany !== null) {
        console.log(`found ${ellenCompany.ticker}`)
        // Now Get the latest recorded earning for company from FMP api
        const numberOfQuartersToStore = 4
        const fmpEarning = await companyEarningBySymbol(
          ellenCompany.ticker,
          numberOfQuartersToStore
        ).catch((err) => {
          console.error(`FMP error for ${ellenCompany.ticker}: ${err}`)
        })

        let storeEarning = false

        try {
          const quarterlyEarning = fmpEarning.data[0]
          // wrap up the below into function
          if (fmpEarning.data[0]) {
            // if calendar Q matches latest earning Q
            const reportedPeriod = quarterlyEarning.period.split('Q')[1]
            const calendarPeriod = calendarResult.quarter

            // and the years match (ie, only look at current year)
            const thisYear = dayjs(new Date()).year()
            const reportedPeriodYear = dayjs(quarterlyEarning.date).year()
            const reportIsThisYear = thisYear == reportedPeriodYear

            if (
              calendarPeriod == reportedPeriod && // matching what the latest reported quarter is
              reportIsThisYear // and to be sure, this year
            ) {
              storeEarning = true
            } else {
              console.log('did not match quarters')
            }
          }

          if (storeEarning) {
            fmpEarning.data.forEach(async (quarterlyEarning) => {
              const createdEarning = await earningCreate(
                quarterlyEarning,
                ellenCompany.id
              )
              if (createdEarning?.dataValues?.id) {
                console.log('stored for', createdEarning.dataValues.ticker)
              }
            })
          }
        } catch (err) {
          console.error(`FMP error / no data: ${err}`)
        }

        sleep(100)
      }
    })

    res.send(200)
  },

  async sendEarningEmail(req, res) {
    // send email to user in the req body
    let latestEarnings = []
    console.log(req.headers.user)

    // for each earnings added today
    // find earning with created today
    const today = new Date()
    let startofServerDay = new Today(today).startOfTodayServer()

    const earnings = await findEarningByDate(startofServerDay)

    // for each earning report
    earnings.forEach(async (earning) => {
      let usersToEmailForThisEarning = []

      // get users who subscribed to underlying company
      const users = await getUsersFromCompanies(earning.ticker)
      const companyRecord = await Company.findOne({
        where: { ticker: earning.ticker },
      })

      users.forEach((user) => {
        usersToEmailForThisEarning.push({ email: user.email })
      })

      console.log(earning.ticker, usersToEmailForThisEarning)

      if (usersToEmailForThisEarning.length > 0) {
        const message = {
          from: 'gregor@ellen.me', // Use the email address or domain you verified above
          template_id: 'd-50dccf286985442db16dd2581e1ec2fe',
          dynamic_template_data: {
            company: companyRecord.nameIdentifier,
            ticker: earning.ticker,
            earning: earning.revenue,
          },
          personalizations: [
            {
              to: [
                {
                  email: 'gregor+noreply@ellen.me',
                },
              ],
              bcc: usersToEmailForThisEarning,
            },
          ],
        }

        sendAnEmail(req, res, message, false)
      }
    })
    res.sendStatus(200)
  },
}

// Basic DB fuctions
async function earningCreate(reqBody, ellenCompanyId) {
  const existingEarning = await Earning.count({
    where: {
      [Op.and]: [
        { ticker: reqBody.symbol },
        { period: reqBody.period },
        { revenue: reqBody.revenue },
      ],
    },
  })

  if (existingEarning == 0) {
    return Earning.create({
      ticker: reqBody.symbol,
      filingDate: reqBody.fillingDate, // typo in the API response from FMP
      period: reqBody.period,
      revenue: reqBody.revenue,
      costOfRevenue: reqBody.costOfRevenue,
      grossProfit: reqBody.grossProfit,
      grossProfitRatio: reqBody.grossProfitRatio,
      ebitda: reqBody.ebitda,
      ebitdaRatio: reqBody.ebitdaratio, // FMP response anomaly, not camelCase formatting
      companyId: ellenCompanyId,
    })
  } else {
    console.log('skipping duplicate stored earning')
  }
}

// assumes that Earning entry is added to DB and checked whether to send out, on the same day
// e.g earnings filings check done at 9am, adds any new reported earnings to DB
// emails triggered at 10am
async function findEarningByDate(date) {
  console.log('datezzz', date)
  return Earning.findAll({
    where: {
      createdAt: {
        [Op.gt]: date,
      },
    },
  })
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
