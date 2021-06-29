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
        return Earning.create({
          ticker: reqBody.symbol,
          filingDate: reqBody.fillingDate, // typo in the API response
          period: reqBody.period,
          revenue: reqBody.revenue,
          costOfRevenue: reqBody.costOfRevenue,
          grossProfit: reqBody.grossProfit,
          grossProfitRatio: reqBody.grossProfitRatio,
          ebitda: reqBody.ebitda,
          ebitdaRatio: reqBody.ebitdaRatio,
        })
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

  getAndStoreQuarterlyEarnings(req, res) {
    allYesterdayEarnings().then((result) => {
      res.send(result.data)
    })
  },
}
