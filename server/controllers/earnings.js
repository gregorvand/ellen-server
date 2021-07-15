const Earning = require('../models').Earning
const Company = require('../models').Company
// const User = require('../models').User
const jwt = require('jsonwebtoken')
const Today = require('../utils/getToday')
const { Op } = require('sequelize')
const dailyEmailController = require('../controllers/dailyEmail')

const calcEarnings = require('../utils/calcEarnings')
const { getUsersFromCompanies } = require('../controllers/companies')
const { removeDuplicates } = require('../utils/helpers')

const { sendAnEmail } = require('../services/email/sendgrid')

const dayjs = require('dayjs')
const { currencyFormatter } = require('../utils/currencyFormatter')

const {
  companyEarningBySymbol,
  allEarningsByPeriod,
} = require('../services/earnings/companyEarningsService')

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

    // -----------------------
    // now make many requests for each company and store any earnigns that match period from calendar
    let allEllenTickersPromise = []
    allCalendarResults.forEach(async (calendarResult) => {
      // Lookup our DB first before making requests for reports, to reduce requests out to FMP
      const ellenCompany = Company.findOne({
        where: { ticker: calendarResult.symbol },
      })

      allEllenTickersPromise.push(ellenCompany)
    })

    // -----------------------
    // wait for DB lookups to finish then continue
    const companiesToCheck = await Promise.all(allEllenTickersPromise)
    let allRetrievedEarnings = []

    companiesToCheck.forEach(async (ellenCompany) => {
      if (ellenCompany !== null) {
        console.log(`ellen: ${ellenCompany.ticker}`)
        // Now Get the latest recorded earning for company from FMP api
        const numberOfQuartersToStore = 4
        const fmpEarning = companyEarningBySymbol(
          ellenCompany.ticker,
          numberOfQuartersToStore
        )

        sleep(200)
        allRetrievedEarnings.push(fmpEarning)
      }
    })

    // -----------------------
    const earningsToCheckAndStore = await Promise.all(allRetrievedEarnings)
    let earningsToStore = []
    earningsToCheckAndStore.forEach(async (fmpEarning) => {
      let storeEarning = false

      const calendarResult = allCalendarResults.find(
        ({ symbol }) => symbol === fmpEarning?.data[0]?.symbol
      )

      const quarterlyEarning = fmpEarning?.data[0]
      if (quarterlyEarning) {
        // wrap up the below into function

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

        if (storeEarning) {
          earningsToStore.push(fmpEarning)
        }
      }
    })

    let flattenedEarnings = []
    earningsToStore.forEach((company) => {
      company.data.forEach((earning) => {
        flattenedEarnings.push(earning)
      })
    })

    let flattenedCompanies = []
    companiesToCheck.forEach((company) => {
      if (company !== null) {
        flattenedCompanies.push(company?.dataValues)
      }
    })

    earningsForEmail = []
    flattenedEarnings.forEach(async (eachEarning) => {
      const ellenCompany = flattenedCompanies.find(
        ({ ticker }) => ticker === eachEarning.symbol
      )

      console.log('tick', eachEarning.symbol)
      const created = earningCreate(eachEarning, ellenCompany.id)
      earningsForEmail.push(created)
    })

    earningsForEmailTickers = []
    const wait = await Promise.all(earningsForEmail)
    wait.forEach((created) => {
      earningsForEmailTickers.push(created?.dataValues?.ticker)
    })

    // GET THIS BIT FIXED AND ADD ELLEN IDS!!! :)
    const noDuplicateTickers = earningsForEmailTickers.filter(function (
      value,
      index,
      array
    ) {
      return array.indexOf(value) == index
    })

    console.log(noDuplicateTickers)
    // -----------------------
    // show notification of sent email tickers
    res.send(noDuplicateTickers)

    // TODO: can remove promise output logging when suitable
    dailyEmailController.create(noDuplicateTickers)
  },

  // takes in an array of tickers under req.body.tickers
  // gets their latest earnings, does some calcs
  // sends the email
  async sendEmailFromTickers(req, res) {
    jwt.verify(req.token, process.env.USER_AUTH_SECRET, (err) => {
      if (err) {
        res.sendStatus(401)
      } else {
        const tickers = req.body.tickers
        console.log(tickers)
        processTickersSendEmail(req, res, tickers)
        res.sendStatus(200)
      }
    })
  },

  // same as above but gets any unsent rows from DailyEmail for tickers
  async sendEarningEmail(req, res) {
    jwt.verify(req.token, process.env.USER_AUTH_SECRET, async (err) => {
      if (err) {
        res.sendStatus(401)
      } else {
        const unsentTickers = await dailyEmailController.unsent()
        if (unsentTickers.length > 0) {
          let tickers = unsentTickers[0].dataValues.tickers
          console.log(tickers)
          await processTickersSendEmail(req, res, tickers)
          dailyEmailController.updateStatus(unsentTickers[0].dataValues.id)
          res.send(`sent emails for ${tickers}`)
        } else {
          res.send('no unsent ticker emails')
        }
      }
    })
  },
}

// Basic DB fuctions
async function earningCreate(reqBody, ellenCompanyId) {
  // some companies come with decimal figures of the following which don't work for us
  // we set those to zero
  const check = ['revenue', 'costOfRevenue', 'grossProfit']
  for (const [key, value] of Object.entries(reqBody)) {
    if (check.includes(key)) {
      if (value < 1) {
        reqBody[key] = 0
      }
    }
  }
  // now check if that earning already exists in DB
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
    return Promise.resolve()
  }
}

async function processTickersSendEmail(req, res, tickers) {
  tickers.forEach(async (companyTicker) => {
    console.log('checking ')
    const earnings = await calcEarnings.getLastFourQuartersEarnings(
      companyTicker
    )
    // do stuff with above arrays like calc change in %
    // variablize for the email

    const revDifference =
      earnings.length > 1
        ? await calcEarnings.calculateDifferenceOfEarnings(earnings)
        : null

    // console.log(
    //   revDifference !== 'undefined' ? revDifference : 'no values'
    // )

    // send off all the earning data to function for formatting
    const earningsData = {
      revenues: [],
      ebitdas: [],
    }

    earnings.forEach((earning) => {
      const data = earning.dataValues
      earningsData['revenues'].push(data.revenue)
      earningsData['ebitdas'].push(data.ebitda)
      // add stuff to an array .e.g all revenues
    })

    // get recipients
    // get users who subscribed to underlying company
    const users = await getUsersFromCompanies(companyTicker)
    const companyRecord = await Company.findOne({
      where: { ticker: companyTicker },
    })

    let usersToEmailForThisEarning = []
    users.forEach((user) => {
      usersToEmailForThisEarning.push({ email: user.email })
    })

    // we can format the data style-wise before passing to template

    let resultColour = 'green'
    let upOrDown = '+'
    if (revDifference < 0) {
      resultColour = 'red'
      upOrDown = ''
    }

    // the data
    const revenueChangeHTML = `<span style="color: ${resultColour};">${upOrDown}${revDifference}%</span>`
    const latestRevenue = currencyFormatter().format(earningsData.revenues[0])
    const latestEbitda = currencyFormatter().format(earningsData.ebitdas[0])

    console.log(companyTicker, usersToEmailForThisEarning)
    // send email
    if (usersToEmailForThisEarning.length > 0) {
      const message = {
        from: 'gregor@ellen.me', // Use the email address or domain you verified above
        template_id: 'd-50dccf286985442db16dd2581e1ec2fe',
        dynamic_template_data: {
          company: companyRecord.nameIdentifier,
          ticker: companyTicker,
          latestRevenue: latestRevenue, // latest revenue figure
          latestEbitda: latestEbitda, // latest revenue figure
          revenueChangeHTML: revenueChangeHTML,
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

    return 'completed'
  })
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
