require('dotenv').config()
const Company = require('../server/models').Company
// const data = require('./fmp_07072021_NASDAQ_ellen_import.json')
const EdisonData = require('./data/EDISON_DATA_SAMPLE_2_ALLBIRDSFULL.json')
const ordersControllerEdison = require('../server/controllers/ordersByEdison')

async function insertEdisonData(data) {
  const rowOneData = data[0]
  console.log(rowOneData)

  let companyId = false
  let newCompany = false

  const isACompany = await Company.findOne({
    where: {
      emailIdentifier: rowOneData.from_domain,
    },
  })

  console.log(isACompany)

  if (isACompany !== null) {
    companyId = isACompany.id
  } else {
    console.log('got to new company..')
    newCompany = await Company.create({
      nameIdentifier: rowOneData.item_reseller,
      emailIdentifier: rowOneData.from_domain,
      orderPrefix: '#',
      companyType: 'private',
    }).then((newCompany) => newCompany)
  }

  newCompany ? (companyId = newCompany.id) : companyId

  console.log('inserting under company', companyId)
  data.forEach((edisonRow) => {
    ordersControllerEdison.insertEdisonRow(companyId, edisonRow)
  })
}

insertEdisonData(EdisonData)
