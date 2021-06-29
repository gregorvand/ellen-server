const axios = require('axios')

async function companyEarningBySymbol(ticker) {
  return await axios({
    method: 'get',
    url: `https://financialmodelingprep.com/api/v3/income-statement/${ticker}?period=quarter&limit=1&apikey=618a872a67c27ab884357f853a051837`,
  })
}

module.exports.companyEarningBySymbol = companyEarningBySymbol
