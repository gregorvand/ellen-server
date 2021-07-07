require('dotenv').config()
const data = require('./fmp_07072021_NASDAQ_ellen_import.json')
const companiesController = require('../server/controllers/companies')

data.forEach((company) => {
  console.log(company.ticker)

  companiesController.internalCreate(
    company.nameIdentifier,
    company.emailIdentifier,
    company
  )
})
