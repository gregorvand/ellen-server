require('dotenv').config()
// const data = require('./fmp_07072021_NASDAQ_ellen_import.json')
const data = require('./data/fmp_07072021_NASDAQ_ellen_import.json')
const companiesController = require('../server/controllers/companies')

data.forEach((company) => {
  companiesController.internalCreate(
    company.nameIdentifier,
    company.emailIdentifier,
    company
  )
})
