const Earning = require('../models').Earning
const jwt = require('jsonwebtoken')
const axios = require('axios')
const Yesterday = require('../utils/getYesterday')

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
  // move to service for FMP?
  getYesterdayEarnings(req, res) {
    jwt.verify(req.token, process.env.USER_AUTH_SECRET, (err) => {
      if (err) {
        res.sendStatus(401)
      } else {
        const today = new Date()
        const getYesterday = new Yesterday(today).dateYesterday()
        console.log(getYesterday)
        // get yesterday, then convert to exchange timezone.. NYC...
        // const marketYesterday = getYesterday
        //   .tz('America/New_York')
        //   .format('YYYY-MM-DD')

        const marketYesterday = '2021-06-25' // for test purposes if yesterday is non business day

        axios({
          method: 'get',
          url: `https://finnhub.io/api/v1/calendar/earnings?from=${marketYesterday}&to=${marketYesterday}&token=c38tm4iad3ido5aka4e0`,
        }).then(({ data }) => {
          res.send(data)
          // console.group(data)
          data.earningsCalendar.forEach((company) => {
            let req = { body: { ticker: `${company.symbol}` } }
            module.exports
              .getQuarterlyEarnings(req)
              .then((earnings) => {
                const earningsData = earnings?.data

                // check if symbol actually reported any earnings
                if (Array.isArray(earningsData) && earningsData.length > 0) {
                  console.log(earnings.data[0].symbol, earnings.data[0].ebitda)
                } else {
                  console.log(`no records for ${company.symbol}`)
                }
              })
              .catch((err) => {
                console.error(err)
              })
          })
        })
      }
    })
  },
  getQuarterlyEarnings(req, res) {
    // jwt.verify(req.token, process.env.USER_AUTH_SECRET, (err) => {
    //   if (err) {
    //     res.sendStatus(401)
    //   } else {
    return axios({
      // return to debug
      method: 'get',
      url: `https://financialmodelingprep.com/api/v3/income-statement/${req.body.ticker}?period=quarter&limit=1&apikey=618a872a67c27ab884357f853a051837`,
    })
    // .then(({ data }) => {
    //   res.send(data)
    // })
    // }
    // })
  },
}
