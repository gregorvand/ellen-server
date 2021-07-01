const data = require('./nyse_csvjson_ellen.json')
const companiesController = require('../server/controllers/companies')

data.forEach((company) => {
  console.log(company.ticker)

  companiesController.internalCreate(
    company.nameIdentifier,
    company.emailIdentifier,
    company
  )
})
