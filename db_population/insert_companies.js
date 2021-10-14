require('dotenv').config()
const Company = require('../server/models').Company
const csv = require('csvtojson')

// get data
const csvFilePath = '../edison_data/2021_10_09_sellers.csv'

async function convertCSV() {
  const jsonArray = await csv({
    // parse order number here to number format for later checks
    colParser: { order_number: 'number' },
  }).fromFile(csvFilePath)
  return jsonArray
}

async function createCompany(dataRow) {
  const isACompany = await Company.findOne({
    where: {
      emailIdentifier: dataRow.from_domain,
    },
  })

  if (isACompany !== null) {
    console.log('skipping, already have', dataRow.item_reseller)
    return
  } else {
    const isADuplicate = await Company.findOne({
      where: {
        nameIdentifier: dataRow.item_reseller,
      },
    })

    const duplicateMarker = isADuplicate !== null ? 'duplicate' : ''

    console.log('duplicate?', isADuplicate)
    const newCompany = await Company.create({
      nameIdentifier: dataRow.item_reseller,
      emailIdentifier: dataRow.from_domain,
      orderPrefix: '#',
      orderSuffix: duplicateMarker,
      companyType: 'private',
      industry: 'Shopify',
    }).then((newCompany) => newCompany)

    return newCompany
  }
}

async function insertEdisonCompanies() {
  const data = await convertCSV()
  // console.log(rowOneData)

  // MULTI ROW
  // comment out below and enable @ 60 to debug one row
  data.map(async (edisonRow) => {
    const company = await createCompany(edisonRow)
    company
      ? console.log('created:', company.nameIdentifier)
      : console.log('moving on..')
  })
}

// run
insertEdisonCompanies()
