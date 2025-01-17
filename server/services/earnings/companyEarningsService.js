const axios = require('axios')
const axiosRetry = require('axios-retry')
const Yesterday = require('../../utils/getYesterday')

// gets the latest 1 record for a compay's quarterly filing
async function companyEarningBySymbol(ticker, numberOfFilings = 1) {
  axiosRetry(axios, { retries: 3 })

  return await axios({
    method: 'get',
    url: `https://financialmodelingprep.com/api/v3/income-statement/${ticker}?period=quarter&limit=${numberOfFilings}&apikey=618a872a67c27ab884357f853a051837`,
  }).catch((err) => {
    console.error(`FMP error for ${ticker}: ${err}`)
  })
}

async function allEarningsByPeriod(lookback = 10) {
  const today = new Date()
  const pastDate = new Yesterday(today).dateBeforeByDays(lookback)
  // get yesterday, then convert to exchange timezone.. NYC...
  const marketBefore = pastDate.tz('America/New_York').format('YYYY-MM-DD')

  // get yesterday, then convert to exchange timezone.. NYC...
  const getYesterday = new Yesterday(today).dateYesterday()
  const marketYesterday = getYesterday
    .tz('America/New_York')
    .format('YYYY-MM-DD')
  // const marketYesterday = '2021-06-25' // for test purposes if yesterday is non business day
  console.log(
    `
    Getting earnings calendar from ${marketYesterday} up to ${marketBefore}
    https://finnhub.io/api/v1/calendar/earnings?from=${marketBefore}&to=${marketYesterday}&token=c38tm4iad3ido5aka4e0
    `
  )
  return await axios({
    method: 'get',
    url: `https://finnhub.io/api/v1/calendar/earnings?from=${marketBefore}&to=${marketYesterday}&token=c38tm4iad3ido5aka4e0`,
  })
}

module.exports.companyEarningBySymbol = companyEarningBySymbol
module.exports.allEarningsByPeriod = allEarningsByPeriod
