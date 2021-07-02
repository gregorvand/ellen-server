const Earning = require('../models').Earning
const Company = require('../models').Company
const jwt = require('jsonwebtoken')
const Today = require('../utils/getToday')
const { Op } = require('sequelize')

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
          res.send(result.data)
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

  getAndStoreQuarterlyEarnings(req, res) {
    const allCalendarResults = []

    // gets all symbols in one request
    allEarningsByPeriod().then((companyList) => {
      console.log(companyList)
      companyList.data.earningsCalendar.forEach((calendarEntry) => {
        allCalendarResults.push(calendarEntry)
      })

      // now make many requests for each company and store any earnigns that match period from calendar
      allCalendarResults.forEach((calendarResult) => {
        console.log(calendarResult)

        // Lookup our DB first before making requests for reports, to reduce requests out to FMP
        Company.findOne({
          where: { ticker: calendarResult.symbol },
        })
          .then((ellenCompany) => {
            if (ellenCompany !== null) {
              console.log(`found ${ellenCompany.ticker}`)

              // Get earnings report from FMP
              const numberOfQuartersToStore = 1
              companyEarningBySymbol(
                ellenCompany.ticker,
                numberOfQuartersToStore
              )
                .then((fmpEarning) => {
                  fmpEarning.data.forEach((quarterlyEarning) => {
                    // if calendar Q matches latest earning Q
                    const reportedPeriod = quarterlyEarning.period.split('Q')[1]
                    const calendarPeriod = calendarResult.quarter

                    // and the years match (ie, only look at current year)
                    const thisYear = dayjs(new Date()).year()
                    const reportedPeriodYear = dayjs(
                      quarterlyEarning.date
                    ).year()

                    const reportIsThisYear = thisYear == reportedPeriodYear

                    // ..then store the earning in our DB
                    if (calendarPeriod == reportedPeriod && reportIsThisYear) {
                      earningCreate(quarterlyEarning, ellenCompany.id).then(
                        (dbResult) => {
                          console.log(
                            `created! for ${quarterlyEarning.period}`,
                            dbResult
                          )
                        }
                      )
                    } else {
                      console.log('did not match quarters')
                    }

                    sleep(100)
                  })
                })
                .catch((err) => {
                  console.error(`failed on ${calendarResult.symbol}`, err)
                })
            }
          })
          .catch((err) => {
            console.error(`db lookup error: ${err}`)
          })
      })
    })

    res.send(200)
  },

  sendEarningEmail(req, res) {
    // send email to user in the req body

    console.log(req.headers.user)

    // for each earnings added today
    // find earning with created today
    const today = new Date()
    let startofServerDay = new Today(today).startOfTodayServer()

    findEarningByDate(startofServerDay).then((earnings) => {
      earnings.forEach((earningRaw) => {
        console.log(earningRaw.dataValues)
      })
    })

    res.sendStatus(200)
    // store object
    // get company ID
    // get users with those IDs subscribed

    // for each user
    // send earning data to that user

    const message = {
      to: req.body.recipient,
      from: 'gregor@ellen.me', // Use the email address or domain you verified above
      subject: req.body.subject,
      text: req.body.emailPlain,
      html: req.body.emailHtml,
    }

    // sendAnEmail(req, res, message)
  },
}

// Basic DB fuctions
async function earningCreate(reqBody, ellenCompanyId) {
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
