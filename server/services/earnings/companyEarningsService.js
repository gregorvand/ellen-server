const axios = require('axios')
const Yesterday = require('../../utils/getYesterday')

async function companyEarningBySymbol(ticker) {
  return await axios({
    method: 'get',
    url: `https://financialmodelingprep.com/api/v3/income-statement/${ticker}?period=quarter&limit=1&apikey=618a872a67c27ab884357f853a051837`,
  })
}

async function allYesterdayEarnings() {
  const today = new Date()
  const getYesterday = new Yesterday(today).dateYesterday()
  // get yesterday, then convert to exchange timezone.. NYC...
  const marketYesterday = getYesterday
    .tz('America/New_York')
    .format('YYYY-MM-DD')

  // const marketYesterday = '2021-06-25' // for test purposes if yesterday is non business day
  return await axios({
    method: 'get',
    url: `https://finnhub.io/api/v1/calendar/earnings?from=${marketYesterday}&to=${marketYesterday}&token=c38tm4iad3ido5aka4e0`,
  })
}

module.exports.companyEarningBySymbol = companyEarningBySymbol
module.exports.allYesterdayEarnings = allYesterdayEarnings
