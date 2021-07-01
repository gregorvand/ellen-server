const Earning = require('../models').Earning
const Company = require('../models').Company
const jwt = require('jsonwebtoken')
const Today = require('../utils/getToday')
const { Op } = require('sequelize')

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
    const allEarningsSymbols = []

    // gets all symbols in one request
    allEarningsByPeriod().then((result) => {
      result.data.earningsCalendar.forEach((result) => {
        allEarningsSymbols.push(result.symbol)
      })

      const numberOfQuartersToStore = 1
      // now make many requests for each company
      allEarningsSymbols.forEach((symbol) => {
        companyEarningBySymbol(symbol, numberOfQuartersToStore)
          .then((result) => {
            result.data.forEach((quarterlyEarning) => {
              earningCreate(quarterlyEarning).then((dbResult) => {
                console.log('created!', dbResult)
              })
            })
          })
          .catch((err) => {
            console.error(`failed on ${symbol}`, err)
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
      earnings.forEach((earning) => {
        console.log('an earning', earning)
      })
    })

    res.send(200)
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
async function earningCreate(reqBody) {
  Company.findOne({
    where: { ticker: reqBody.symbol },
  })
    .then((ellenCompany) => {
      if (ellenCompany !== null) {
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
          companyId: ellenCompany.id,
        })
      }
    })
    .catch((err) => {
      console.log(`could not find an Ellen DB entry for ${reqBody.symbol}`, err)
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
