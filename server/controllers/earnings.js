const Earning = require('../models').Earning
const jwt = require('jsonwebtoken')

const {
  companyEarningBySymbol,
  allYesterdayEarnings,
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
  getYesterdayEarnings(req, res) {
    jwt.verify(req.token, process.env.USER_AUTH_SECRET, (err) => {
      if (err) {
        res.sendStatus(401)
      } else {
        allYesterdayEarnings().then((result) => {
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
  // make requests for each set of earnings
  // store earning
  // on to the next
  // return success
  getAndStoreQuarterlyEarnings(req, res) {
    const allEarningsSymbols = []
    allEarnings = []

    // gets all symbols in one request
    allYesterdayEarnings().then((result) => {
      result.data.earningsCalendar.forEach((result) => {
        allEarningsSymbols.push(result.symbol)
      })

      // now make many requests for each company
      allEarningsSymbols.forEach((symbol) => {
        companyEarningBySymbol(symbol)
          .then((result) => {
            earningCreate(result.data[0]).then((dbResult) => {
              console.log('created!', dbResult.ticker)
            })
          })
          .catch((err) => {
            console.error(`failed on ${symbol}`, err)
          })
      })
    })

    res.send(200)
  },
}

// Basic DB fuctions
async function earningCreate(reqBody) {
  return Earning.create({
    ticker: reqBody.symbol,
    filingDate: reqBody.fillingDate, // typo in the API response
    period: reqBody.period,
    revenue: reqBody.revenue,
    costOfRevenue: reqBody.costOfRevenue,
    grossProfit: reqBody.grossProfit,
    grossProfitRatio: reqBody.grossProfitRatio,
    ebitda: reqBody.ebitda,
    ebitdaRatio: reqBody.ebitdaratio,
  })
}
